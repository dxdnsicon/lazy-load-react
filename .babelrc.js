module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          browsers: ['last 2 versions', 'IE >= 9'],
        },
        loose: true,
        modules: false,
      },
    ],
    ['@babel/preset-react'],
    ['@babel/preset-typescript'],
  ],
  plugins: [
    [
      '@babel/plugin-proposal-decorators',
      {
        legacy: true,
      },
    ],
    '@babel/plugin-proposal-class-properties',
    [
      '@babel/plugin-transform-runtime',
      {
        absoluteRuntime: false,
        corejs: false,
        helpers: true,
        regenerator: true,
        useESModules: true,
      },
    ],
    '@babel/plugin-transform-typescript',
  ]
}