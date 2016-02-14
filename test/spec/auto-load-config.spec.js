"use strict";

process.env.NODE_CONFIG_DIR = "test/config";
process.env.NODE_APP_INSTANCE = "0";
delete process.env.AUTO_LOAD_CONFIG_OFF;

const autoLoadConfig = require("../../lib/auto-load-config");
const config = require("../../config");
const composedResult = require("../composed-result");

describe("auto-load-config", function () {
  const result = composedResult();

  const resetEnv = () => {
    delete process.env.AUTO_LOAD_CONFIG_OFF;
    delete process.env.AUTO_LOAD_CONFIG_PROCESS_OFF;
    delete process.env.NODE_CONFIG_DIR;
    delete process.env.NODE_ENV;
    delete process.env.NODE_APP_INSTANCE;
    delete process.env.NODE_CONFIG;
  };

  beforeEach(resetEnv);

  it("should load config", () => {
    expect(config).to.deep.equal(result);
  });

  it("should skip instance file if it's not defined", () => {
    process.env.NODE_CONFIG_DIR = "test/config";
    config._$.reset();
    autoLoadConfig(config);
    expect(config.instance0).to.equal(undefined);
  });

  it("should use default location if NODE_CONFIG_DIR is not defined", () => {
    config._$.reset();
    expect(config).to.deep.equal({});
    delete process.env.NODE_CONFIG_DIR;
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
    config._$.reset();
    expect(config).to.deep.equal({});
    process.env.AUTO_LOAD_CONFIG_OFF = "true";
    autoLoadConfig(config, {dir: "test/config"});
    expect(config).to.deep.equal({});
  });

  it("should not process if AUTO_LOAD_CONFIG_PROCESS_OFF is set", () => {
    config._$.reset();
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
});
