"use strict";

const _ = require("lodash");
const Hoek = require("hoek");
const fs = require("fs");

function processObj(obj, data) {
  const depthPath = data.depth.join(".");

  _.each(obj, (v, k) => {
    if (_.isObject(v)) {
      data.depth.push(k);
      processObj(v, data);
      data.depth.pop();
      return;
    }

    const resolve = (tmpl) => {
      const refs = tmpl.split(":");
      const path = refs[0];


      if (path.startsWith("-")) {
        return path.substr(1);
      }

      const x = Hoek.reach(data.context, path);

      if (_.isFunction(x)) {
        return x({
          context: data.context,
          config: data.config,
          obj, key: k, value: v, tmpl, params: _.drop(refs), depthPath
        });

      } else if (_.isUndefined(x)) {
        data.missing.push({path: `${depthPath}.${k}`, value: v, tmpl});
        return "";

      } else {
        const extras = _(refs).drop().map(resolve).value().join("");
        return `${x}${extras}`;
      }
    };

    if (_.isString(v) && _.contains(v, "{{")) {
      obj[k] = v.replace(/\{\{([^}]+)}}/g, (match, tmpl) => {
        const newV = resolve(tmpl);
        data.more += _.contains(newV, "{{") ? 1 : 0;
        return newV;
      });
    }
  });
}

function processConfig(config, options) {
  if (_.isEmpty(config)) {
    return [];
  }

  options = options || {};

  const context = {
    config,
    process,
    argv: process.argv,
    cwd: process.cwd(),
    env: process.env,
    now: Date.now,
    readFile: (data) => {
      if (data.params[0]) {
        const enc = data.params[1] || "utf8";
        return fs.readFileSync(data.params[0].trim()).toString(enc.trim());
      }
      throw new Error("config file readFile template missing filename");
    }
  };

  _.defaults(context, options.context);

  const data = {config, context, options, more: 1, missing: [], depth: ["config"]};
  const maxRun = 20;

  for (let i = 0; data.more > 0; i++) {
    if (i >= maxRun) {
      throw new Error(`Unable to process config after ${maxRun} passes.`);
    }
    data.more = 0;
    processObj(config, data);
  }

  return data.missing;
}

module.exports = processConfig;
