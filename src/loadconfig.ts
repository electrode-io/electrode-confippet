import store from "./store";

const configs = {};

const uniqueKey = (stringArray: any) => {
  return stringArray.join("");
};

/**
 * load a configuration by passing composeOptions, and default options if desired
 *
 * @param composeOptions Confippet compose Options
 * @param defaults default config values
 * @param refresh should the config be refreshed
 * @returns returns config
 */
export const loadConfig = (composeOptions, defaults, refresh) => {
  const cacheKey = uniqueKey(composeOptions.dirs);
  let config = configs[cacheKey];

  if (!config) {
    config = store();
  }

  if (refresh) {
    config._$.reset();
  }

  if (!configs[cacheKey] || refresh) {
    if (!refresh) config._cached = true; //this ok?
    config._$.defaults(defaults);
    config._$.compose(composeOptions);
    configs[cacheKey] = config;
  }

  return config;
};
