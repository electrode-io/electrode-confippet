import * as jsYaml from "js-yaml";
import * as fs from "fs";

/**
 * Load a config partial from a JS module
 *
 * @param fullFilePath full path to the the file
 *
 * @returns If it's an ES6 module and has `default`, then `default` is returned,
 *   else returns the module as config partial.
 */
function loadJs(fullFilePath: string): unknown {
  const configMod = require(fullFilePath);

  if (configMod.__esModule) {
    if (configMod.hasOwnProperty("default")) {
      return configMod.default;
    } else {
      // will be using the whole module as config partial, so hide the ES module flag
      try {
        Object.defineProperty(configMod, "__esModule", { enumerable: false });
      } catch {
        // oh well, can't hide it
      }
    }
  }

  return configMod;
}

export = {
  json: loadJs,
  js: loadJs,
  yaml: (fullDirPath: string) => jsYaml.load(fs.readFileSync(fullDirPath, "utf8")),
  ts: loadJs,
};
