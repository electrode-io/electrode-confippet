"use strict";

const Confippet = require("../..");

describe("store", function () {
  it("should create a config store", () => {
    const store = Confippet.store();
    store._$.use({
      foo: {
        x: {
          val: [
            "bar",
            "blah",
            "hello"
          ]
        }
      }
    });

    store._$.defaults({
      d: {
        val: [
          {
            foo: {
              x: 10
            }
          },
          {
            hello: "world"
          }
        ]
      },
      foo: {
        x: "oops",
        bar: "hello"
      }
    });

    expect(store.$("foo.x.val.0")).to.equal("bar");
    expect(store.$("foo.x.val.1")).to.equal("blah");
    expect(store.$("foo.x.val.2")).to.equal("hello");
    expect(store.$([])).to.deep.equal(undefined);
    expect(store.$("")).to.equal(undefined);
    expect(store.$(true)).to.equal(undefined);
    expect(store.$(5)).to.equal(undefined);

    expect(store.d.val[0].foo.x).to.equal(10);
    expect(store.$("d.val.0.foo.x")).to.equal(10);
    expect(store.$("foo.bar")).to.equal("hello");

    store._$.use({
      foo: {
        x: {
          val: "500"
        }
      },
      p: {
        y: [
          "{{config.foo.x.val}}",
          {
            k: "{{config.foo.bar}}"
          },
          {
            n: "{{env.TEST_N}}"
          }
        ]
      }
    });

    expect(store.$("foo.x.val")).to.equal("500");
    process.env.TEST_N = "nn1";
    store._$.process();
    delete process.env.TEST_N;
    expect(store.$("p.y.0")).to.equal("500");
    expect(store.$("p.y.1.k")).to.equal("hello");
    expect(store.$("p.y.2.n")).to.equal("nn1");

    store._$.reset();
    expect(store).to.deep.equal({});

    store._$.compose({
      dir: "test/config"
    });

    const result = require("../composed-result")();
    delete result.instance0;

    expect(store).to.deep.equal(result);
    expect(store.$("arr[0]")).to.equal("js");
    expect(store.$("arr[1]")).to.equal(1);
    expect(store.$("arr[2].b")).to.equal(50);
  });
});
