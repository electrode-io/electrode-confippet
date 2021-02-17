/* eslint-disable */

import { loadConfig } from "../../lib/load-config";
import * as Path from "path";
import { expect } from "chai";

describe("confippet loadConfig", function () {
  it("should compose config from directory", () => {
    const config: any = loadConfig(
      {
        dir: Path.join(__dirname, "../config1"),
        context: {
          deployment: "default",
        },
      },
      { foo: "bar" }
    );

    expect(config).to.have.property("foo");
    expect(config.js).to.equal("1");
  });

  it("should hand back cached config", () => {
    const config: any = loadConfig(
      {
        dir: Path.join(__dirname, "../config1"),
        context: {
          deployment: "default",
        },
      },
      { foo: "bar2" }
    );

    const symbols = Object.getOwnPropertySymbols(config);
    expect(symbols.map((x) => x.toString())).includes(`Symbol(confippet loadConfig cached config)`);
    expect(config).to.have.property("foo");
    expect(config.foo).to.equal("bar");
    expect(config.js).to.equal("1");
  });

  it("should reload cached config", () => {
    const config: any = loadConfig(
      {
        dir: Path.join(__dirname, "../config1"),
        context: {
          deployment: "default",
        },
      },
      { foo: "bar2" },
      true
    );
    expect(config).to.have.property("foo");
    expect(config.foo).to.equal("bar2");
  });

  it("should allow loading new copy w/o cache", () => {
    const config: any = loadConfig(
      {
        dir: Path.join(__dirname, "../config1"),
        context: {
          deployment: "default",
        },
        cache: false,
      },
      { foo: "bar2" }
    );
    const symbols = Object.getOwnPropertySymbols(config);
    expect(symbols.map((x) => x.toString())).not.includes(
      `Symbol(confippet loadConfig cached config)`
    );
    expect(config).to.have.property("foo");
    expect(config.foo).to.equal("bar2");
  });

  it("should load config from ES6 modules", () => {
    const config: any = loadConfig(
      {
        dir: Path.join(__dirname, "../esm-config"),
        context: {
          deployment: "test",
        },
      },
      { foo: "bar2" }
    );
    expect(config.esm).equal(true);
    expect(config.test).equal("test");
    // __esModule flag should've been hidden
    expect(Object.keys(config)).to.not.include("__esModule");
  });
});
