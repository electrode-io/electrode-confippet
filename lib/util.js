"use strict";

const _ = require("lodash");

const util = {
  replaceArray: (a, b) => _.isArray(b) && b || undefined,
  merge: function () {
    Array.prototype.push.call(arguments, util.replaceArray);
    return _.merge.apply(_, arguments); // eslint-disable-line
  }
};

module.exports = util;
