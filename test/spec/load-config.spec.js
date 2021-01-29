const { loadConfig } = require("../..");
const path = require("path");
const { expect } = require("chai");

describe("confippet loadConfig", function () {
  it("should compose config from directory", function () {
    const config = loadConfig(
      {
        dirs: [path.join(__dirname, "../config1")],
        context: {
          deployment: "default",
        },
      },
      { foo: "bar" }
    );

    expect(config).to.have.property("foo");
    expect(config.js).to.equal("1");
  });

  it("should hand back cached config", function () {
    const config = loadConfig(
      {
        dirs: [path.join(__dirname, "../config1")],
        context: {
          deployment: "default",
        },
      },
      { foo: "bar2" }
    );

    expect(config).to.have.property("_cached");
    expect(config).to.have.property("foo");
    expect(config.foo).to.equal("bar");
    expect(config.js).to.equal("1");
  });

  it("should reload cached config", function () {
    const config = loadConfig(
      {
        dirs: [path.join(__dirname, "../config1")],
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
});
