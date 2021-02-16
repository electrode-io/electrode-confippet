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

    // expect(config).to.have.property("_cached");
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
    expect(config).to.not.have.property("_cached");
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
