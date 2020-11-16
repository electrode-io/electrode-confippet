import * as jsYaml from "js-yaml";
import * as fs from "fs";

export = {
  json: require,
  js: require,
  yaml: (fullF) => jsYaml.load(fs.readFileSync(fullF, "utf8"))
};
