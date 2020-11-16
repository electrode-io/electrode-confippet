import * as Path from "path";
import * as fs from "fs";
import _ from "lodash";
import assert from "assert";
import defaultOpts from "./default-compose-opts";
import providerTypes from "./provider-types";
import processConfig from "./process-config";
import util from "./util";

/* eslint-disable max-statements */
function composeConfigDir(dir, data, options) {
  const exts = options.extSearch;
  const handlers = options.extHandlers;

  dir = Path.resolve(dir);

  const load = (key, provider) => {
    const found = exts.map((ext) => {
      const fullF = Path.join(dir, `${provider.name}.${ext}`);

      if (fs.existsSync(fullF)) {
        assert(handlers[ext], `Config handler for extension ${ext} missing`);
        util.uMerge(data, handlers[ext](fullF));
        return ext;
      }

      return undefined;
    }).filter((x) => x);

    if (_.isEmpty(found)) {
      const msg = `Config provider ${key}: no file ${provider.name} of ` +
        `extensions ${exts} found in ${dir}`;

      if (provider.type === providerTypes.required) {
        if (options.failMissing !== false) {
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
    // if it's an array any element of the array is falsy => filtered off
    // otherwise if itself is falsy => filtered off
    return _.isArray(filter) ? _.find(filter, (x) => !x) !== undefined : !filter;
  };

  const isEnable = (p) => {
    const x = p.filter;
    assert(p.type, "config provider type must be specified");
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

  const providers = options.providers;

  const getList = () => options.providerList || Object.keys(providers);

  const list = getList().filter((k) => isEnable(providers[k]));

  assert(list.length > 0, "config providers empty");

  list.sort((a, b) => order(providers[a]) - order(providers[b]))
    .forEach((k) => {
      const p = providers[k];
      if (p.handler) {
        if (options.verbose) {
          console.log("Confippet.compose: calling config provider:", k, JSON.stringify(p)); // eslint-disable-line
        }
        util.uMerge(data, p.handler());
      } else {
        if (options.verbose) {
          console.log("Confippet.compose: loading config provider:", k, JSON.stringify(p)); // eslint-disable-line
        }
        load(k, p);
      }
    });

  return data;
}

function composeConfig(options) {
  options = options || {};

  if (options.useDefaults !== false) {
    options = util.merge(defaultOpts(), options);
  }

  processConfig(options, options);

  const dirs = options.dirs || [options.dir];
  const data = {};

  dirs.forEach((dir) => {
    composeConfigDir(dir, data, options);
  });

  return data;
}

export = composeConfig;
