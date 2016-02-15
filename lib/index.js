"use strict";

/* eslint-disable global-require */

const confippet = {
  processConfig: require("./process-config"),
  composeConfig: require("./compose-config"),
  store: require("./store"),
  providerTypes: require("./provider-types")
};

Object.defineProperty(confippet, "config", {
  get: () => require("../config")
});

module.exports = confippet;
