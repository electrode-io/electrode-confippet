"use strict";

const autoLoadConfig = require("../../lib/auto-load-config");
const composedResult = require("../composed-result");
const Hoek = require("hoek");
const Confippet = require("../../");

describe("auto-load-config", function () {
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
    autoLoadConfig(config);
    expect(config.instance0).to.equal(undefined);
  });

  it("should use default location if NODE_CONFIG_DIR is not defined", () => {
    process.env.NODE_APP_INSTANCE = "0";
    process.env.NODE_CONFIG = JSON.stringify({
      tx: "{{config.json}}"
    });
    autoLoadConfig(config, {dir: "test/config"});
    expect(config.$("tx")).to.equal("json");
    delete config.tx;
    expect(config).to.deep.equal(result);
  });

  it("should not auto load if AUTO_LOAD_CONFIG_OFF is set", () => {
    expect(config).to.deep.equal({});
    process.env.AUTO_LOAD_CONFIG_OFF = "true";
    autoLoadConfig(config, {dir: "test/config"});
    expect(config).to.deep.equal({});
  });

  it("should not process if AUTO_LOAD_CONFIG_PROCESS_OFF is set", () => {
    expect(config).to.deep.equal({});
    process.env.AUTO_LOAD_CONFIG_PROCESS_OFF = "true";
    process.env.NODE_APP_INSTANCE = "0";
    process.env.NODE_CONFIG = JSON.stringify({
      tx: "{{config.json}}"
    });
    autoLoadConfig(config, {dir: "test/config"});
    expect(config.$("tx")).to.equal("{{config.json}}");
    delete config.tx;
    expect(config).to.deep.equal(result);
  });

  it("should load production if set", () => {
    process.env.NODE_CONFIG_DIR = "test/config";
    process.env.NODE_APP_INSTANCE = "0";
    process.env.NODE_ENV = "production";
    autoLoadConfig(config);
    const prodResult = Hoek.clone(result);
    prodResult.deployment = "prod";
    expect(config).to.deep.equal(prodResult);
  });
});
