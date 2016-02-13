"use strict";

const jsYaml = require("js-yaml");
const fs = require("fs");

module.exports = {
  json: require,
  js: require,
  yaml: (fullF) => jsYaml.load(fs.readFileSync(fullF, "utf8"))
};
