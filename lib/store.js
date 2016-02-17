"use strict";
const _ = require("lodash");
const processConfig = require("./process-config");
const composeConfig = require("./compose-config");
const util = require("./util");

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
    _.merge(this.store, data, util.replaceArray);
  }

  defaults(data) {
    _.defaultsDeep(this.store, _.clone(data));
  }

  compose(info) {
    _.merge(this.store, composeConfig(info), util.replaceArray);
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

function $get(p) {
  return _.get(this, p); // eslint-disable-line
}

function factory() {
  const store = {};

  store.$ = $get;

  store._$ = new Config(store);

  hideProperties(store, ["$", "_$"]);

  return store;
}

module.exports = factory;
