module.exports = {
  presets: [
    '@babel/typescript',
    ['@babel/preset-env', {
      modules: false,
      targets: {
        browsers: [
          'iOS >= 6',
          'Android > 4.0',
          'not ie <= 8',
        ],
      },
    }],
  ],
  plugins: [
    ['@babel/plugin-transform-typescript', { allowNamespaces: true }]
  ],
}