import util from "./util";

function load(config, options) {
  options = options || {};

  const dirs = [];

  for (let i = 0, dir = ""; (dir = process.env[`NODE_CONFIG_DIR_${i}`]); ++i) {
    dirs.push(dir);
  }

  if (dirs.length > 0 && process.env.NODE_CONFIG_DIR) {
    dirs.push(process.env.NODE_CONFIG_DIR);
  }

  if (dirs.length > 0) {
    console.log("config dirs", dirs); // eslint-disable-line
  }

  util.merge(options, {
    dirs: dirs.length > 0 && dirs,
    dir: process.env.NODE_CONFIG_DIR,
    context: {
      deployment: process.env.NODE_ENV,
      instance: process.env.NODE_APP_INSTANCE
    }
  });

  config._$.compose(options);

  if (!process.env.AUTO_LOAD_CONFIG_PROCESS_OFF) {
    config._$.process();
  }
}

function autoLoad(config, options) {
  if (!process.env.AUTO_LOAD_CONFIG_OFF) {
    load(config, options);
  }
}

export = {
  load,
  autoLoad
};
