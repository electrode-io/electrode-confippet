"use strict";

const providerTypes = require("./provider-types");
const Hoek = require("hoek");

module.exports = {
  dir: "config",
  extSearch: ["json", "yaml", "js"],
  extHandlers: require("./ext-handlers"), // eslint-disable-line
  failMissingRequired: true,
  warnMissing: true,
  verbose: false,
  //
  // {{deployment}} - resolves to process.env.NODE_ENV
  // {{instance}} - resolves to process.env.NODE_APP_INSTANCE
  // {{hostname}} - resolves to hostname
  // {{fullHostname}} - resolves to full hostname
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
      order: 110
    },
    "deployment": {
      name: "{{deployment}}",
      filter: ["{{defaultFilter}}"],
      type: "{{defaultType}}",
      order: 120
    },
    "envInstance": {
      name: "{{deployment}}-{{instance}}",
      filter: ["{{defaultFilter}}", "{{instance}}"],
      type: providerTypes.warn,
      order: 130
    },
    "hostname": {
      name: "{{hostname}}",
      filter: ["{{defaultFilter}}"],
      type: providerTypes.optional,
      order: 140
    },
    "hostnameInstance": {
      name: "{{hostname}}-{{instance}}",
      filter: ["{{defaultFilter}}", "{{hostname}}", "{{instance}}"],
      type: providerTypes.optional,
      order: 150
    },
    "hostnameDeployment": {
      name: "{{hostname}}-{{deployment}}",
      filter: ["{{defaultFilter}}", "{{hostname}}"],
      type: providerTypes.optional,
      order: 160
    },
    "hostnameDeploymentInstance": {
      name: "{{hostname}}-{{deployment}}-{{instance}}",
      filter: ["{{defaultFilter}}", "{{hostname}}", "{{instance}}"],
      type: providerTypes.optional,
      order: 170
    },
    "fullHostname": {
      name: "{{fullHostname}}",
      filter: ["{{defaultFilter}}", "{{fullHostname}}"],
      type: providerTypes.optional,
      order: 180
    },
    "fullHostnameInstance": {
      name: "{{fullHostname}}-{{instance}}",
      filter: ["{{defaultFilter}}", "{{fullHostname}}", "{{instance}}"],
      type: providerTypes.warn,
      order: 190
    },
    "fullHostnameDeployment": {
      name: "{{fullHostname}}-{{deployment}}",
      filter: ["{{defaultFilter}}", "{{fullHostname}}"],
      type: providerTypes.optional,
      order: 200
    },
    "fullHostnameDeploymentInstance": {
      name: "{{fullHostname}}-{{deployment}}-{{instance}}",
      filter: ["{{defaultFilter}}", "{{fullHostname}}", "{{instance}}"],
      type: providerTypes.warn,
      order: 210
    },
    "local": {
      name: "local",
      filter: ["{{defaultFilter}}"],
      type: providerTypes.optional,
      order: 220
    },
    "localInstance": {
      name: "local-{{instance}}",
      filter: ["{{defaultFilter}}", "{{instance}}"],
      type: providerTypes.warn,
      order: 230
    },
    "localDeployment": {
      name: "local-{{deployment}}",
      filter: ["{{defaultFilter}}"],
      type: providerTypes.optional,
      order: 240
    },
    "localDeploymentInstance": {
      name: "local-{{deployment}}-{{instance}}",
      filter: ["{{defaultFilter}}", "{{instance}}"],
      type: providerTypes.warn,
      order: 250
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
      order: 99999999 // eslint-disable-line
    },
    "confippetEnv": {
      filter: ["{{defaultFilter}}"],
      type: providerTypes.required,
      handler: function () {
        const data = {};
        Object.keys(process.env).forEach((k) => {
          if (k.startsWith("CONFIPPET")) {
            Hoek.merge(data, JSON.parse(process.env[k]), true, false);
          }
        });

        return data;
      },
      order: 99999999 + 1 // eslint-disable-line
    }

  },
  context: {
    deployment: process.env.NODE_ENV || "development",
    instance: process.env.NODE_APP_INSTANCE || "",
    hostname: "",
    fullHostname: "",
    defaultType: providerTypes.required,
    defaultFilter: "enabled" // NOTE: set this to "" or undefined to disable all default providers
  }
};
