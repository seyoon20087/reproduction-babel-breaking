'use strict';

var create = require('./create-CE5mKmUn.cjs');
require('path');
require('./index-DDQISHMI.cjs');
require('@babel/types');
require('@babel/traverse');
require('@babel/core');
require('assert');
require('module');
require('fs');
require('os');

function dev(api, opts) {
  return create.create(api, Object.assign({ helpers: false }, opts), "development");
}

module.exports = dev;
