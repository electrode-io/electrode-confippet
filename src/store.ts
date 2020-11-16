import * as _ from "lodash";
import processConfig from "./process-config";
import composeConfig from "./compose-config";
import util from "./util";

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
  store: any;
  constructor(store) {
    this.store = store;
  }

  use(data) {
    util.merge(this.store, data);
  }

  defaults(data) {
    _.defaultsDeep(this.store, _.clone(data));
  }

  compose(info) {
    util.merge(this.store, composeConfig(info));
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
  const store: any = {};

  store.$ = $get;

  store._$ = new Config(store);

  hideProperties(store, ["$", "_$"]);

  return store;
}

export = factory;
