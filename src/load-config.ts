import store from "./store";
import * as Path from "path";
import presetConfig from "./preset-config";

const configs = {};

/**
 * handler for a config file of a specific extension
 *
 * @param _fullFilePath full path to the config file
 * @returns the config object loaded from the file
 */
export type ExtHandler = (_fullFilePath: string) => unknown; // eslint-disable-line

/**
 * Type of a config partial provider:
 *
 * - `required` - config partial file must exist for the provider
 * - `disabled` - do not run the provider
 * - `optional` - config partial file doesn't need to exist for the provider
 * - `warn` - log a warning if partial file doesn't exist for the provider
 */
export type ProviderTypes = "required" | "disabled" | "optional" | "warn";

/**
 * Context of environment values to determine which config partial to load from a config directory
 */
export type LoadContext = {
  /** deployment env. Take from env `NODE_ENV` if not specified. **Default**: "development" */
  deployment?: string;
  /** process instance. Take from env `NODE_APP_INSTANCE` if not specified.  **Default**: `""` */
  instance?: string;

  /**
   * Provider type for the internal `default` and `deployment` config provider.
   * **Default** `"required"` - which means user must have a `default.js` and a file for the NODE_ENV
   * deployment, such as `development.js` or `production.js`
   */
  defaultType?: ProviderTypes;

  /**
   * default filter for providers - default filtering rule for internal providers.
   *
   * - **Default** `"enabled"` - all internal providers are enabled
   * - Set this to `""` and all default providers are disabled and you must set your own providers
   *   to load config partials
   *
   */
  defaultFilter?: "enabled" | "";
  /** short hostname */
  hostname?: string;
  /** full FQDN hostname */
  fullHostname?: string;
};

/**
 * Options for loading and composing config partial files from a directory
 *
 * Sample:
 *
 * ```ts
 * import { loadConfig } from "electrode-confippet";
 *
 * const config = loadConfig({
 *   dir: Path.join(__dirname, "config")
 * })
 * ```
 */
export type LoadOptions = {
  /**
   * The directory to load config files from.  Will use `Path.resolve` to generate
   * absolute full path for each one.
   */
  dir: string;

  /**
   * Customize config file extensions search.
   *
   * **Default**: `["json", "yaml", "js", "ts"]
   */
  extSearch?: string[];

  /**
   * Custom handlers for a file extension
   *
   * **For Example**:
   *
   * ```js
   * {
   *   yaml: (fullF) => jsYaml.load(fs.readFileSync(fullF, "utf8"))
   * }
   * ```
   */
  extHandlers?: Record<string, ExtHandler>;

  /** Throw error if a partial provider requires config file but it's missing */
  failMissing?: boolean;

  /** `console.error` a warning if a partial provider requires config file but it's missing */
  warnMissing?: boolean;

  /** Enable `console.log` noises about what's happening */
  verbose?: boolean;

  /** set to `false` to skip cache, load and return a new copy, **Default**: `true` */
  cache?: boolean;

  /**
   * Environment setting context
   *
   * Not for typical use cases.  The context generally come from
   * env variables: `NODE_ENV` and `NODE_APP_INSTANCE`
   */
  context?: LoadContext;
};

const CACHED = Symbol("confippet loadConfig cached config");

/**
 * Load config files from a directory.
 *
 * - the directory can contain multiple files, each has a partial config.  this function
 *   will load the files according to various environment settings and compose them
 *   into a single one.
 *
 * - Each config file in the directory can be JSON, JS, Yaml, or TS.  For JS or TS, if it's
 *   ES6 Module and has `default` export, then it's used as config partial, else the whole
 *   module will be used.
 *
 * - The result is cached using the full directory path
 *
 * @param options LoadOptions for loading config files
 * @param defaults default config values
 * @param refresh refresh the cached copy - **NOTE** this will clear any values user set in the config
 *
 * @returns returns config
 */
export const loadConfig = (options: LoadOptions, defaults?: unknown, refresh?: boolean) => {
  const cache = options.cache !== false;

  const cacheKey = Path.resolve(options.dir);

  const config = (cache && configs[cacheKey]) || store();

  if (!cache || !config[CACHED] || refresh) {
    config._$.reset();
    config._$.defaults(defaults);
    presetConfig.load(config, { ...options });
    if (cache) {
      config[CACHED] = true;
      configs[cacheKey] = config;
    }
  }

  return config;
};
