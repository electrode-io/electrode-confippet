"use strict";

const config = require("./lib/store")();
const autoLoadConfig = require("./lib/auto-load-config");

autoLoadConfig(config);

module.exports = config;
