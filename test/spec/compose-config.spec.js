"use strict";

const Path = require("path");
const providerTypes = require("../../lib/provider-types");
const intercept = require("intercept-stdout");
const Confippet = require("../..");
const composedResult = require("../composed-result");
const util = require("../../lib/util");
const _ = require("lodash");

describe("confippet composeConfig", function () {
  it("should compose config from directory", function () {
    let logs = 0;
    const unhookIntercept = intercept(function (txt) {
      if (txt.startsWith("Confippet.compose:")) {
        logs++;
      }
    });

    const result = _.merge({
      "foo": {
        "bar": "env"
      },
      "node": {
        "config": "xyz"
      }
    }, composedResult(), util.replaceArray);

    process.env.CONFIPPET_0 = JSON.stringify({
      foo: {bar: "env"}
    });
    process.env.NODE_CONFIG = JSON.stringify({
      node: {config: "xyz"}
    });
    const data = Confippet.composeConfig({
      dir: Path.join(__dirname, "../config"),
      verbose: true,
      providers: {
        env: {
          type: providerTypes.required
        }
      },
      context: {
        instance: "0"
      }
    });
    unhookIntercept();
    const env = data.env;
    delete data.env;
    expect(data).to.deep.equal(result);
    expect(env).to.deep.equal(process.env);
    expect(logs).to.be.above(0);
    delete process.env.CONFIPPET_0;
    delete process.env.NODE_CONFIG;
  });

  it("should compose extensions according to extSearch", function () {
    const data = Confippet.composeConfig({
      dir: Path.join(__dirname, "../config"),
      extSearch: ["js", "json", "yaml"],
      context: {
        instance: "0"
      }
    });
    expect(data.js).to.equal("yaml");
  });

  it("should not fail required when requested not to", function () {
    process.env.CONFIPPET_0 = JSON.stringify({
      foo: {bar: "env"}
    });
    const data = Confippet.composeConfig({
      dir: Path.join(__dirname, "../data"),
      failMissing: false
    });
    expect(data.foo.bar).to.equal("env");
    delete process.env.CONFIPPET_0;
  });

  const testWarn = (warnMissing) => {
    let warn = 0;
    const unhookIntercept = intercept(function (txt) {
      if (txt.startsWith("WARNING:")) {
        warn++;
      }
    });
    Confippet.composeConfig({
      dir: Path.join(__dirname, "../config"),
      warnMissing,
      context: {
        instance: "0"
      }
    });
    if (warnMissing) {
      expect(warn).to.be.above(0);
    } else {
      expect(warn).to.equal(0);
    }
    unhookIntercept();
  };

  it("should warn if warn provider missing", function () {
    testWarn(true);
  });

  it("should warn if warn provider missing but requested not to", function () {
    testWarn(false);
  });

  it("should throw when no config can be found", function () {
    expect(Confippet.composeConfig).to.throw(Error);
  });

  it("should throw when no config provided", function () {
    expect(() => Confippet.composeConfig({useDefaults: false})).to.throw(Error);
  });

  it("should throw when provider type missing", function () {
    expect(() => {
      Confippet.composeConfig({
        failMissing: false,
        warnMissing: false,
        providers: {
          "a": {
            handler: () => {
            }
          }
        }
      });
    }).to.throw(Error);
  });

  it("should throw when providers resolve to empty", function () {
    expect(() => {
      Confippet.composeConfig({
        failMissing: false,
        warnMissing: false,
        providerList: []
      });
    }).to.throw(Error);
  });

  it("should turn off all default providers by flag", function () {
    expect(() => {
      Confippet.composeConfig({
        failMissing: false,
        warnMissing: false,
        context: {
          defaultFilter: ""
        }
      });
    }).to.throw(Error);
  });

  it("should turn all default required to optional by flag", function () {
    Confippet.composeConfig({
      warnMissing: false,
      context: {
        defaultType: providerTypes.optional
      }
    });
  });

  it("should call provider w/o order as -1", function () {
    let bCalled = false;
    let cCalled = false;
    Confippet.composeConfig({
      failMissing: false,
      warnMissing: false,
      providerList: ["a", "b", "c", "e"],
      providers: {
        "c": {
          type: providerTypes.required,
          handler: () => {
            cCalled = true;
          },
          order: "-2"
        },
        "b": {
          type: providerTypes.required,
          handler: () => {
            expect(cCalled).to.equal(true);
            bCalled = true;
          },
          filter: "enabled",
          order: 0
        },
        "a": {
          type: providerTypes.required,
          handler: () => {
            expect(bCalled).to.equal(false);
          }
        },
        "d": {
          type: providerTypes.required,
          handler: () => {
            throw new Error("not expect provider d to be called");
          }
        },
        "e": {
          type: providerTypes.required,
          handler: () => {
            throw new Error("not expect provider e to be called");
          },
          filter: false
        }
      }
    });
  });
});
