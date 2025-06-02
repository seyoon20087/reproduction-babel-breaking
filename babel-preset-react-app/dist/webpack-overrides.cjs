'use strict';

var crypto = require('crypto');

const macroCheck = new RegExp("[./]macro");
function webpackOverrides() {
  return {
    // This function transforms the Babel configuration on a per-file basis
    config(config, { source }) {
      if (macroCheck.test(source)) {
        return Object.assign({}, config.options, {
          caller: Object.assign({}, config.options.caller, {
            craInvalidationToken: crypto.randomBytes(32).toString("hex")
          })
        });
      }
      return config.options;
    }
  };
}

module.exports = webpackOverrides;
