'use strict';

var create = require('./create--pzd-rQl.cjs');
require('path');
require('./index-n3FxmJ6u.cjs');
require('@babel/types');
require('@babel/traverse');
require('@babel/core');
require('assert');
require('module');
require('fs');
require('os');

function prod(api, opts) {
  return create.create(api, Object.assign({ helpers: false }, opts), "production");
}

module.exports = prod;
