"use strict";

const providerTypes = require("./provider-types");
const util = require("./util");

const envOrder = 1000;
const confippetEnvOrder = 2000;

module.exports = function () {
  return {
    dir: "config",
    extSearch: ["json", "yaml", "js"],
    extHandlers: require("./ext-handlers"), // eslint-disable-line
    failMissing: true, // whether fails if a required provider missing
    warnMissing: true, // whether warns if a warn provider missing
    verbose: false,
    providerList: undefined,
    //
    // {{deployment}} - resolves to "development" by default
    // {{instance}} - resolves to "" by default
    // {{hostname}} - resolves to "" by default
    // {{fullHostname}} - resolves to "" by default
    //
    // types: required, optional, warn, disabled
    //
    providers: {
      "default": {
        name: "default",
        filter: ["{{defaultFilter}}"],
        type: "{{defaultType}}",
        order: 100
      },
      "defaultInstance": {
        name: "default-{{instance}}",
        filter: ["{{defaultFilter}}", "{{instance}}"],
        type: providerTypes.warn,
        order: 120
      },
      "deployment": {
        name: "{{deployment}}",
        filter: ["{{defaultFilter}}"],
        type: "{{defaultType}}",
        order: 140
      },
      "deploymentInstance": {
        name: "{{deployment}}-{{instance}}",
        filter: ["{{defaultFilter}}", "{{instance}}"],
        type: providerTypes.warn,
        order: 160
      },
      "hostname": {
        name: "{{hostname}}",
        filter: ["{{defaultFilter}}"],
        type: providerTypes.optional,
        order: 180
      },
      "hostnameInstance": {
        name: "{{hostname}}-{{instance}}",
        filter: ["{{defaultFilter}}", "{{hostname}}", "{{instance}}"],
        type: providerTypes.optional,
        order: 200
      },
      "hostnameDeployment": {
        name: "{{hostname}}-{{deployment}}",
        filter: ["{{defaultFilter}}", "{{hostname}}"],
        type: providerTypes.optional,
        order: 220
      },
      "hostnameDeploymentInstance": {
        name: "{{hostname}}-{{deployment}}-{{instance}}",
        filter: ["{{defaultFilter}}", "{{hostname}}", "{{instance}}"],
        type: providerTypes.optional,
        order: 240
      },
      "fullHostname": {
        name: "{{fullHostname}}",
        filter: ["{{defaultFilter}}", "{{fullHostname}}"],
        type: providerTypes.optional,
        order: 260
      },
      "fullHostnameInstance": {
        name: "{{fullHostname}}-{{instance}}",
        filter: ["{{defaultFilter}}", "{{fullHostname}}", "{{instance}}"],
        type: providerTypes.warn,
        order: 280
      },
      "fullHostnameDeployment": {
        name: "{{fullHostname}}-{{deployment}}",
        filter: ["{{defaultFilter}}", "{{fullHostname}}"],
        type: providerTypes.optional,
        order: 300
      },
      "fullHostnameDeploymentInstance": {
        name: "{{fullHostname}}-{{deployment}}-{{instance}}",
        filter: ["{{defaultFilter}}", "{{fullHostname}}", "{{instance}}"],
        type: providerTypes.warn,
        order: 320
      },
      "local": {
        name: "local",
        filter: ["{{defaultFilter}}"],
        type: providerTypes.optional,
        order: 340
      },
      "localInstance": {
        name: "local-{{instance}}",
        filter: ["{{defaultFilter}}", "{{instance}}"],
        type: providerTypes.warn,
        order: 360
      },
      "localDeployment": {
        name: "local-{{deployment}}",
        filter: ["{{defaultFilter}}"],
        type: providerTypes.optional,
        order: 380
      },
      "localDeploymentInstance": {
        name: "local-{{deployment}}-{{instance}}",
        filter: ["{{defaultFilter}}", "{{instance}}"],
        type: providerTypes.warn,
        order: 400
      },
      "env": {
        filter: ["{{defaultFilter}}"],
        type: providerTypes.disabled,
        handler: function () {
          const env = {};
          Object.keys(process.env).forEach((k) => {
            env[k] = process.env[k];
          });

          return {env};
        },
        order: envOrder
      },
      "confippetEnv": {
        filter: ["{{defaultFilter}}"],
        type: providerTypes.required,
        handler: function () {
          const data = {};
          Object.keys(process.env).forEach((k) => {
            if (k === "NODE_CONFIG" || k.startsWith("CONFIPPET")) {
              util.uMerge(data, JSON.parse(process.env[k]));
            }
          });

          return data;
        },
        order: confippetEnvOrder
      }

    },
    context: {
      deployment: "development",
      instance: "",
      hostname: "",
      fullHostname: "",
      defaultType: providerTypes.required,
      defaultFilter: "enabled" // NOTE: set this to "" or undefined to disable all default providers
    }
  };
};
