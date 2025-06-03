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

function index(api, opts) {
  const env = process.env.BABEL_ENV || process.env.NODE_ENV;
  return create.create(api, opts, env);
}

module.exports = index;
