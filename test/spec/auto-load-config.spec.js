"use strict";

process.env.NODE_CONFIG_DIR = "test/config";
delete process.env.AUTO_LOAD_CONFIG_OFF;

const autoLoadConfig = require("../../lib/auto-load-config");
const config = require("../../config");
const composedResult = require("../composed-result");

describe("auto-load-config", function () {
  const result = composedResult();

  it("should load config", () => {
    expect(config).to.deep.equal(result);
  });

  it("should use default location if NODE_CONFIG_DIR is not defined", () => {
    config._$.reset();
    expect(config).to.deep.equal({});
    delete process.env.NODE_CONFIG_DIR;
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
    delete process.env.NODE_CONFIG_DIR;
    process.env.AUTO_LOAD_CONFIG_OFF = "true";
    autoLoadConfig(config, {dir: "test/config"});
    expect(config).to.deep.equal({});
  });

  it("should not process if AUTO_LOAD_CONFIG_PROCESS_OFF is set", () => {
    config._$.reset();
    expect(config).to.deep.equal({});
    delete process.env.NODE_CONFIG_DIR;
    delete process.env.AUTO_LOAD_CONFIG_OFF;
    process.env.AUTO_LOAD_CONFIG_PROCESS_OFF = "true";
    process.env.NODE_CONFIG = JSON.stringify({
      tx: "{{config.json}}"
    });
    autoLoadConfig(config, {dir: "test/config"});
    expect(config.$("tx")).to.equal("{{config.json}}");
    delete config.tx;
    expect(config).to.deep.equal(result);
  });
});
