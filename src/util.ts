import * as _ from "lodash";

const util = {
  replaceArray: (a, b) => (_.isArray(b) && b) || undefined,
  merge: function (...args) {
    Array.prototype.push.call(args, util.replaceArray);
    return _.mergeWith.apply(_, args); // eslint-disable-line
  },
  //
  // if both are arrays and key starts with "+" then union the arrays
  //
  unionArray: (a, b, k) => {
    if (_.isArray(b)) {
      if (k.startsWith("+") && _.isArray(a)) {
        return _.union(a, b);
      }
      return b;
    }
    return undefined;
  },

  uMerge: function (...args) {
    Array.prototype.push.call(args, util.unionArray);
    return _.mergeWith.apply(_, args); // eslint-disable-line
  }
};

export = util;
