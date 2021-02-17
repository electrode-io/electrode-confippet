/* eslint-disable */

"use strict";

const presetConfig = require("../../lib/preset-config");
const composedResult = require("../composed-result");
const _ = require("lodash");
const Confippet = require("../../");

describe("preset-config", function () {
  const result = composedResult();
  let config;

  const resetEnv = () => {
    delete process.env.AUTO_LOAD_CONFIG_OFF;
    delete process.env.AUTO_LOAD_CONFIG_PROCESS_OFF;
    delete process.env.NODE_CONFIG_DIR;
    delete process.env.NODE_ENV;
    delete process.env.NODE_APP_INSTANCE;
    delete process.env.NODE_CONFIG;
  };

  before(() => {
    resetEnv();
    process.env.NODE_CONFIG_DIR = "test/config";
    process.env.NODE_APP_INSTANCE = "0";
    config = Confippet.config;
    expect(config).to.deep.equal(result);
  });

  beforeEach(() => {
    resetEnv();
    config._$.reset();
    expect(config).to.deep.equal({});
  });

  it("should skip instance file if it's not defined", () => {
    process.env.NODE_CONFIG_DIR = "test/config";
    presetConfig.autoLoad(config);
    expect(config.instance0).to.equal(undefined);
  });

  it("should use default location if NODE_CONFIG_DIR is not defined", () => {
    process.env.NODE_APP_INSTANCE = "0";
    process.env.NODE_CONFIG = JSON.stringify({
      tx: "{{config.json}}",
    });
    presetConfig.autoLoad(config, { dir: "test/config" });
    expect(config.$("tx")).to.equal("json");
    delete config.tx;
    expect(config).to.deep.equal(result);
  });

  it("should not auto load if AUTO_LOAD_CONFIG_OFF is set", () => {
    expect(config).to.deep.equal({});
    process.env.AUTO_LOAD_CONFIG_OFF = "true";
    presetConfig.autoLoad(config, { dir: "test/config" });
    expect(config).to.deep.equal({});
  });

  it("should not process if AUTO_LOAD_CONFIG_PROCESS_OFF is set", () => {
    expect(config).to.deep.equal({});
    process.env.AUTO_LOAD_CONFIG_PROCESS_OFF = "true";
    process.env.NODE_APP_INSTANCE = "0";
    process.env.NODE_CONFIG = JSON.stringify({
      tx: "{{config.json}}",
    });
    presetConfig.autoLoad(config, { dir: "test/config" });
    expect(config.$("tx")).to.equal("{{config.json}}");
    delete config.tx;
    expect(config).to.deep.equal(result);
  });

  it("should load production if set", () => {
    process.env.NODE_CONFIG_DIR = "test/config";
    process.env.NODE_APP_INSTANCE = "0";
    process.env.NODE_ENV = "production";
    presetConfig.autoLoad(config);
    const prodResult = _.cloneDeep(result);
    prodResult.deployment = "prod";
    prodResult.arr = ["prod", 1, "2"];
    expect(config).to.deep.equal(prodResult);
  });

  it("should load configs from multiple directories", () => {
    process.env.NODE_CONFIG_DIR = "test/config";
    process.env.NODE_CONFIG_DIR_0 = "test/config1";
    process.env.NODE_APP_INSTANCE = "0";
    process.env.NODE_ENV = "production";
    presetConfig.autoLoad(config);
    const prodResult = _.cloneDeep(result);
    prodResult.default1 = "json";
    prodResult.deployment = "prod";
    prodResult.deployment1 = "production";
    prodResult.arr = ["prod", 1, "2"];
    expect(config).to.deep.equal(prodResult);
  });
});
