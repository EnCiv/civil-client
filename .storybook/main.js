const webpack = require('webpack')

/** @type { import('@storybook/react-webpack5').StorybookConfig } */
const config = {
  stories: ['../stories/**/*.stories.mdx', '../stories/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-links'],
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  webpackFinal: async config => {
    // config may or may not have these properties so we have to make sure they are there and then modify them to ensure we don't delete anything
    if (!config.resolve) config.resolve = {}
    if (!config.resolve.fallback) config.resolve.fallback = {}
    Object.assign(config.resolve.fallback, {
      fs: false,
      buffer: require.resolve('buffer'),
      path: require.resolve('path-browserify'),
      stream: require.resolve('stream-browserify'),
      os: require.resolve('os-browserify/browser'),
      zlib: require.resolve('browserify-zlib'),
      constants: require.resolve('constants-browserify'),
      util: require.resolve('util/'),
    })
    // Add babel-loader so JSX in story files is transpiled
    config.module.rules.push({
      test: /\.jsx?$/,
      exclude: /node_modules/,
      use: 'babel-loader',
    })
    if (!config.plugins) config.plugins = []
    config.plugins.push(new webpack.ProvidePlugin({ Buffer: ['buffer', 'Buffer'] }))
    config.plugins.push(new webpack.ProvidePlugin({ process: 'process/browser' })) // fix "process is not defined" error: // (do "npm install process" before running the build)
    for (const plugin of config.plugins) {
      if (plugin.definitions) {
        if (plugin.definitions['process.env']) {
          console.info('.storybook/main.js: deleting process.env from', { plugin }, 'see comments in that file')
          delete plugin.definitions['process.env']
          /* 
        webpack will try to string replace process.env with what is assigned in the definition. 
          // But if there is code in the browser side that does something like "if(process.env)" it will get replaced and cause syntax error and break the existing code
        */
        }
      }
    }
    return config
  },
}

module.exports = config
