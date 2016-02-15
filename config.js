"use strict";

const config = require("./lib/store")();
const presetConfig = require("./lib/preset-config");

presetConfig.load(config);

module.exports = config;
