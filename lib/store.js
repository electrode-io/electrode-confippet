"use strict";
const _ = require("lodash");
const processConfig = require("./process-config");
const composeConfig = require("./compose-config");
const Hoek = require("hoek");

function hideProperties(obj, props) {
  props.forEach((prop) => {
    Object.defineProperty(obj, prop, {
      enumerable: false,
      writable: false,
      configurable: false
    });
  });
}

class Config {
  constructor(store) {
    this.store = store;
  }

  use(data) {
    Hoek.merge(this.store, data, true, false);
  }

  defaults(data) {
    data = Hoek.clone(data);
    _.defaultsDeep(this.store, data);
  }

  compose(info) {
    Hoek.merge(this.store, composeConfig(info), true, false);
  }

  process(options) {
    processConfig(this.store, options);
  }

  reset() {
    const keys = Object.keys(this.store);
    keys.forEach((k) => {
      delete this.store[k];
    });
  }
}

const reach = (obj, p) => {
  let tk;

  if (_.isArray(p)) {
    tk = p;
  } else if (_.isString(p)) {
    tk = p.split(".");
  } else {
    return undefined;
  }

  /* eslint-disable no-empty */
  for (let i = 0; i < tk.length && obj; obj = obj[tk[i]], ++i) {
  }

  return obj;
};

function $get(p) {
  return reach(this, p); // eslint-disable-line
}

function factory() {
  const store = {};

  store.$ = $get;

  store._$ = new Config(store);

  hideProperties(store, [ "$", "_$"]);

  return store;
}

module.exports = factory;
