'use strict';

var require$$0 = require('path');
var index = require('./index-n3FxmJ6u.cjs');
require('@babel/types');
require('@babel/traverse');
require('@babel/core');
require('assert');
require('module');
require('fs');
require('os');

const validateBoolOption = (name, value, defaultValue) => {
  if (typeof value === "undefined") {
    value = defaultValue;
  }
  if (typeof value !== "boolean") {
    throw new Error(`Preset react-app: '${name}' option must be a boolean.`);
  }
  return value;
};
function dependencies(api, opts) {
  if (!opts) {
    opts = {};
  }
  var env = process.env.BABEL_ENV || process.env.NODE_ENV;
  var isEnvDevelopment = env === "development";
  var isEnvProduction = env === "production";
  var isEnvTest = env === "test";
  var areHelpersEnabled = validateBoolOption("helpers", opts.helpers, false);
  var useAbsoluteRuntime = validateBoolOption(
    "absoluteRuntime",
    opts.absoluteRuntime,
    true
  );
  var absoluteRuntimePath = void 0;
  if (useAbsoluteRuntime) {
    absoluteRuntimePath = require$$0.dirname(
      require.resolve("@babel/runtime/package.json")
    );
  }
  if (!isEnvDevelopment && !isEnvProduction && !isEnvTest) {
    throw new Error(
      'Using `babel-preset-react-app` requires that you specify `NODE_ENV` or `BABEL_ENV` environment variables. Valid values are "development", "test", and "production". Instead, received: ' + JSON.stringify(env) + "."
    );
  }
  return {
    // Babel assumes ES Modules, which isn't safe until CommonJS
    // dies. This changes the behavior to assume CommonJS unless
    // an `import` or `export` is present in the file.
    // https://github.com/webpack/webpack/issues/4039#issuecomment-419284940
    sourceType: "unambiguous",
    presets: [
      isEnvTest && [
        // ES features necessary for user's Node version
        index.babelPresetEnv,
        {
          targets: {
            node: "current"
          },
          // Exclude transforms that make all code slower
          exclude: ["transform-typeof-symbol"]
        }
      ],
      (isEnvProduction || isEnvDevelopment) && [
        // Latest stable ECMAScript features
        index.babelPresetEnv,
        {
          // Allow importing core-js in entrypoint and use browserlist to select polyfills
          useBuiltIns: "entry",
          // Set the corejs version we are using to avoid warnings in console
          // This will need to change once we upgrade to corejs@3
          corejs: 3,
          // Exclude transforms that make all code slower
          exclude: ["transform-typeof-symbol"]
        }
      ]
    ].filter(Boolean),
    plugins: [
      // Disabled as it's handled automatically by preset-env, and `selectiveLoose` isn't
      // yet merged into babel: https://github.com/babel/babel/pull/9486
      // Related: https://github.com/facebook/create-react-app/pull/8215
      // [
      //   require('@babel/plugin-transform-destructuring').default,
      //   {
      //     // Use loose mode for performance:
      //     // https://github.com/facebook/create-react-app/issues/5602
      //     loose: false,
      //     selectiveLoose: [
      //       'useState',
      //       'useEffect',
      //       'useContext',
      //       'useReducer',
      //       'useCallback',
      //       'useMemo',
      //       'useRef',
      //       'useImperativeHandle',
      //       'useLayoutEffect',
      //       'useDebugValue',
      //     ],
      //   },
      // ],
      // Polyfills the runtime needed for async/await, generators, and friends
      // https://babeljs.io/docs/en/babel-plugin-transform-runtime
      [
        index.babelPluginTransformRuntime,
        {
          corejs: false,
          helpers: areHelpersEnabled,
          // By default, babel assumes babel/runtime version 7.0.0-beta.0,
          // explicitly resolving to match the provided helper functions.
          // https://github.com/babel/babel/issues/10261
          version: require(["@babel/runtime/package.json"][0]).version,
          regenerator: true,
          // https://babeljs.io/docs/en/babel-plugin-transform-runtime#useesmodules
          // We should turn this on once the lowest version of Node LTS
          // supports ES Modules.
          useESModules: isEnvDevelopment || isEnvProduction,
          // Undocumented option that lets us encapsulate our runtime, ensuring
          // the correct version is used
          // https://github.com/babel/babel/blob/090c364a90fe73d36a30707fc612ce037bdbbb24/packages/babel-plugin-transform-runtime/src/index.js#L35-L42
          absoluteRuntime: absoluteRuntimePath
        }
      ]
    ].filter(Boolean)
  };
}

module.exports = dependencies;
