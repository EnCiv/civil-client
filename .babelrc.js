// Use commonjs modules only for CLI (dist/ generation); keep ESM for webpack/Storybook.
// babel-loader sets caller.name = 'babel-loader'; CLI has no caller.
module.exports = function (api) {
  const isWebpack = api.caller(c => c && c.name === 'babel-loader')
  return {
    presets: [
      '@babel/preset-react',
      ['@babel/preset-env', { targets: { node: '24' }, modules: isWebpack ? false : 'commonjs' }],
    ],
    plugins: [
      '@babel/plugin-transform-class-properties',
      '@babel/plugin-transform-runtime',
      '@babel/plugin-transform-object-rest-spread',
    ],
  }
}
