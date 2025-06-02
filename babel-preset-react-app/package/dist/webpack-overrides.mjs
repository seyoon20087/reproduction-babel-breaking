import { randomBytes } from 'crypto';

const macroCheck = new RegExp("[./]macro");
function webpackOverrides() {
  return {
    // This function transforms the Babel configuration on a per-file basis
    config(config, { source }) {
      if (macroCheck.test(source)) {
        return Object.assign({}, config.options, {
          caller: Object.assign({}, config.options.caller, {
            craInvalidationToken: randomBytes(32).toString("hex")
          })
        });
      }
      return config.options;
    }
  };
}

export { webpackOverrides as default };
