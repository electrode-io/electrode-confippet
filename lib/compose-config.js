"use strict";

const Path = require("path");
const fs = require("fs");
const _ = require("lodash");
const assert = require("assert");
const defaultOpts = require("./default-compose-opts");
const providerTypes = require("./provider-types");
const processConfig = require("./process-config");
const Hoek = require("hoek");

/* eslint-disable max-statements */
function composeConfig(options) {
  options = options || {};

  if (options.useDefaults !== false) {
    options = Hoek.merge(Hoek.clone(defaultOpts), options, true, false);
  }

  processConfig(options, options);

  const exts = options.extSearch;
  const dir = Path.resolve(options.dir);
  const handlers = defaultOpts.extHandlers;
  const data = {};

  const load = (key, provider) => {
    const found = exts.map((ext) => {
      const fullF = Path.join(dir, `${provider.name}.${ext}`);

      if (fs.existsSync(fullF)) {
        assert(handlers[ext], `Handler for ext ${ext} missing`);
        Hoek.merge(data, handlers[ext](fullF), true, false);
        return ext;
      }
    }).filter((x) => x);

    if (_.isEmpty(found)) {
      const msg = `Config provider ${key}: no file ${provider.name} of extensions ${exts} found`;

      if (provider.type === providerTypes.required) {
        if (options.failMissingRequired !== false) {
          throw new Error(msg);
        }
      } else if (provider.type === providerTypes.warn) {
        if (options.warnMissing !== false) {
          console.error("WARNING:", msg); // eslint-disable-line
        }
      }
    }
  };

  const filterOff = (filter) => {
    return _.isArray(filter) ? _.find(filter, (x) => !x) !== undefined : filter;
  };

  const isEnable = (p) => {
    const x = p.filter;
    assert(p.type, "provider type must be specified");
    return p.type !== providerTypes.disabled && (p.name || p.handler) &&
      (x === undefined ? true : !filterOff(x));
  };

  const num = (x) => {
    return _.isString(x) ? parseInt(x, 10) : x;
  };
  const checkNaN = (x) => {
    return isNaN(x) ? -1 : x; // eslint-disable-line
  };
  const order = (p) => checkNaN(num(p.order));

  const providerList = () => options.pickProviders || Object.keys(options.providers);

  const providers = providerList().filter((k) => isEnable(options.providers[k]));

  assert(providers.length > 0, "providers empty");

  providers.sort((a, b) => order(options.providers[a]) - order(options.providers[b]))
    .forEach((k) => {
      const p = options.providers[k];
      if (p.handler) {
        if (options.verbose) {
          console.log("Confippet.compose: calling config provider:", k, JSON.stringify(p)); // eslint-disable-line
        }
        Hoek.merge(data, p.handler(), true, false);
      } else {
        if (options.verbose) {
          console.log("Confippet.compose: loading config provider:", k, JSON.stringify(p)); // eslint-disable-line
        }
        load(k, p);
      }
    });

  return data;
}

module.exports = composeConfig;
