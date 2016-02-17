"use strict";

const _ = require("lodash");

module.exports = {
  replaceArray: (a, b) => _.isArray(b) && b || undefined
};
