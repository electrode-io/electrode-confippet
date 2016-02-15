"use strict";

const config = require("./lib/store")();
const presetConfig = require("./lib/preset-config");

presetConfig.autoLoad(config);

module.exports = config;
