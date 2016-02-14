"use strict";

function autoLoadConfig(config, options) {
  if (!process.env.AUTO_LOAD_CONFIG_OFF) {
    options = options || {};

    if (process.env.NODE_CONFIG_DIR) {
      options.dir = process.env.NODE_CONFIG_DIR;
    }

    config._$.compose(options);

    if (!process.env.AUTO_LOAD_CONFIG_PROCESS_OFF) {
      config._$.process();
    }
  }
}

module.exports = autoLoadConfig;
