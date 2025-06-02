import babelPresetReactApp from "babel-preset-react-app";
import babelPresetReactAppDeps from "babel-preset-react-app/dependencies";

const targetBrowsers = {
  // support all browsers that implement WebAssembly
  // except Internet Explorer
  // https://caniuse.com/wasm
  // https://caniuse.com/sharedarraybuffer
  chrome: 57,
  firefox: 52,
  edge: 16,
  opera: 44,
  safari: 11,
};
const shouldUseSourceMap = true;

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  productionBrowserSourceMaps: shouldUseSourceMap,
  webpack: (
    config,
    { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack },
  ) => {
    config.module.rules.unshift(
      {
        test: /\.(js|cjs|mjs|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
            options: {
              babelrc: false,
              configFile: false,
              presets: [[babelPresetReactApp, { runtime: "automatic" }]],
              targets: targetBrowsers,
              sourceMaps: shouldUseSourceMap,
              inputSourceMap: shouldUseSourceMap,
            },
          },
        ],
      },
      {
        test: /\.(js|cjs|mjs)$/,
        include: /node_modules/,
        exclude: [
          /@babel(?:\/|\\{1,2})runtime/,
          /@swc(?:\/|\\{1,2})helpers/,
          /node_modules[\\/]core-js/,
          /node_modules[\\/]webpack[\\/]buildin/,
          // /node_modules[\\/]next\/dist/,
        ],
        use: [
          {
            loader: "babel-loader",
            options: {
              babelrc: false,
              configFile: false,
              compact: !dev,
              presets: [[babelPresetReactAppDeps, { helpers: true }]],
              targets: targetBrowsers,
              sourceMaps: shouldUseSourceMap,
              inputSourceMap: shouldUseSourceMap,
            },
          },
        ],
      },
    );

    return config;
  },
};

export default nextConfig;
