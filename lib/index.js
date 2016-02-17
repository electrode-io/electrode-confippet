"use strict";

/* eslint-disable global-require */

const confippet = {
  processConfig: require("./process-config"),
  composeConfig: require("./compose-config"),
  presetConfig: require("./preset-config"),
  store: require("./store"),
  providerTypes: require("./provider-types"),
  extHandlers: require("./ext-handlers"),
  util: require("./util")
};

Object.defineProperty(confippet, "config", {
  get: () => require("../config")
});

module.exports = confippet;
