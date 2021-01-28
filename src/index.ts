/* eslint-disable global-require */

import processConfig from "./process-config";
import composeConfig from "./compose-config";
import presetConfig from "./preset-config";
import store from "./store";
import providerTypes from "./provider-types";
import util from "./util";
import extHandlers from "./ext-handlers";
import loadConfig from "./loadconfig";

const confippet = {
  processConfig: processConfig,
  composeConfig: composeConfig,
  presetConfig: presetConfig,
  store: store,
  providerTypes: providerTypes,
  extHandlers: extHandlers,
  util: util,
  loadConfig: loadConfig
};

Object.defineProperty(confippet, "config", {
  get: () => require("../config")
});

export = confippet;
