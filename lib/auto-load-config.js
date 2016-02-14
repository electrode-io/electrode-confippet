"use strict";

const Hoek = require("lodash");

function autoLoadConfig(config, options) {
  if (!process.env.AUTO_LOAD_CONFIG_OFF) {
    options = options || {};

    Hoek.merge(options, {
      dir: process.env.NODE_CONFIG_DIR,
      context: {
        deployment: process.env.NODE_ENV,
        instance: process.env.NODE_APP_INSTANCE
      }
    }, true, false);

    config._$.compose(options);

    if (!process.env.AUTO_LOAD_CONFIG_PROCESS_OFF) {
      config._$.process();
    }
  }
}

module.exports = autoLoadConfig;
