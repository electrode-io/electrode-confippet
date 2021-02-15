"use strict";

const _ = require("lodash");
const Confippet = require("../..");
const fs = require("fs");

const expect = require("chai").expect;

describe("processConfig", function () {
  it("should do nothing for empty config", () => {
    expect(Confippet.processConfig().length).to.equal(0);
    expect(Confippet.processConfig(false).length).to.equal(0);
    expect(Confippet.processConfig("").length).to.equal(0);
    expect(Confippet.processConfig({}).length).to.equal(0);
    expect(Confippet.processConfig([]).length).to.equal(0);
    expect(Confippet.processConfig(undefined).length).to.equal(0);
    expect(Confippet.processConfig(null).length).to.equal(0);
  });

  it("should not process config w/o templates", () => {
    const config = {
      a: "a",
      d1234: true,
      etewe: 50,
      "f-qeoir": {
        "g~1234{{}}": {
          h: 100
        }
      }
    };

    const save = _.cloneDeep(config);
    Confippet.processConfig(config);
    delete config.env;
    delete config.argv;
    expect(config).to.deep.equal(save);
  });

  it("should process all templates in config", () => {
    const config = {
      x: "{{config.y}}",
      n0: "{{argv.0}}",
      n1: "{{argv.1}}",
      y: "{{config.testFile}}",
      p: "{{process.cwd}}",
      testFile: "{{process.cwd}}/test/data-{{env.NODE_APP_INSTANCE}}.txt",
      acwd: "{{cwd}}",
      now: "{{now}}",
      bad: "{{bad}}",
      badConf: "{{config.bad1.bad2}}",
      badN1: {
        badN2: {
          badN3: "{{config.badx.bady}}"
        }
      },
      mm: {
        nn: {
          aa: [
            {
              m: {
                n: {
                  mx: "{{config.m.n.x}}"
                }
              }
            },
            {
              m: {
                n: {
                  my: "{{config.m.n.y}}"
                }
              }
            }
          ]
        }
      },
      m: {
        n: {
          x: "50",
          y: "60"
        }
      },
      key: "{{readFile: test/data/foo.txt : ascii}}",
      key2: "{{readFile:test/data/foo.txt}}",
      crazy: "{{cwd:- now :process.cwd}}",
      pointless: "{{- pointless }}",
      lowerEnv1: "{{getEnv:foo1:lowerCase}}",
      lowerEnv2: "{{getEnv:foo1:LC}}",
      upperEnv1: "{{getEnv:foo1:upperCase}}",
      upperEnv2: "{{getEnv:foo1:UC}}",
      unchangeEnv1: "{{getEnv:foo1}}",
      unchangeEnv2: "{{getEnv:foo1:???}}",
      badEnv: "{{getEnv:bad_env}}",
      badEnv2: "{{getEnv}}",
      ui: {
        env: "{{env.NODE_ENV}}"
      }
    };

    process.env.NODE_APP_INSTANCE = 5;
    process.env.NODE_ENV = "development";
    process.env.foo1 = "FooBar";
    const missing = Confippet.processConfig(config);
    expect(config.mm.nn.aa[0].m.n.mx).to.equal("50");
    expect(config.mm.nn.aa[1].m.n.my).to.equal("60");
    expect(config.x).to.equal(`${process.cwd()}/test/data-5.txt`);
    expect(config.n0).to.equal(process.argv[0]);
    expect(config.n1).to.equal(process.argv[1]);
    expect(config.y).to.equal(config.x);
    expect(config.p).to.equal(process.cwd());
    expect(parseInt(config.now, 10)).to.be.above(0);
    expect(config.bad).to.equal("");
    expect(config.badConf).to.equal("");
    expect(config.key).to.equal(fs.readFileSync("test/data/foo.txt").toString("ascii"));
    expect(config.key2).to.equal(fs.readFileSync("test/data/foo.txt").toString("utf8"));
    expect(config.crazy).to.equal(`${process.cwd()} now ${process.cwd()}`);
    expect(config.pointless).to.equal(` pointless `);
    expect(config.ui.env).to.equal("development");
    expect(config.badEnv).to.equal("undefined");
    expect(config.badEnv2).to.equal("undefined");
    expect(config.lowerEnv1).to.equal("foobar");
    expect(config.lowerEnv2).to.equal("foobar");
    expect(config.upperEnv1).to.equal("FOOBAR");
    expect(config.upperEnv2).to.equal("FOOBAR");
    expect(config.unchangeEnv1).to.equal("FooBar");
    expect(config.unchangeEnv2).to.equal("FooBar");
    expect(missing.length).to.equal(3);
    expect(missing[0].path).to.equal("config.bad");
    expect(missing[0].value).to.equal("{{bad}}");
    expect(missing[1].path).to.equal("config.badConf");
    expect(missing[1].value).to.equal("{{config.bad1.bad2}}");
    expect(missing[2].path).to.equal("config.badN1.badN2.badN3");
    expect(missing[2].value).to.equal("{{config.badx.bady}}");
  });

  it("should throw error if readFile missing filename", () => {
    const config = {
      key: "{{readFile}}"
    };
    expect(() => Confippet.processConfig(config)).to.throw();
  });

  it("should throw error if readFile missing file", () => {
    const config = {
      key: "{{readFile:missing_file.txt}}"
    };
    expect(() => Confippet.processConfig(config)).to.throw();
  });

  it("should throw error for circular templates", () => {
    const config = {
      x: "{{config.x}}"
    };

    expect(() => Confippet.processConfig(config)).to.throw();
  });
});
