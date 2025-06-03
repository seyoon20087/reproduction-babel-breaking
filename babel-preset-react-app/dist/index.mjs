import { c as create } from './create-C5bgBMNV.mjs';
import 'path';
import './index-DLRSovG0.mjs';
import '@babel/types';
import '@babel/traverse';
import '@babel/core';
import 'assert';
import 'module';
import 'fs';
import 'os';

function index(api, opts) {
  const env = process.env.BABEL_ENV || process.env.NODE_ENV;
  return create(api, opts, env);
}

export { index as default };
