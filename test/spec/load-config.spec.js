const { loadConfig } = require("../../lib");
const path = require("path");
const { expect } = require("chai");


describe("confippet loadConfig", function () {
    it("should compose config from directory", function () {
        const config = loadConfig(
            {
                dirs: [path.join(__dirname, "../config1")],
                context: {
                  deployment: "default"
                }
            },
            { foo: "bar" }
        );

        expect(config).to.have.property("foo");
        expect(config.js).to.equal("1");
    });
});
