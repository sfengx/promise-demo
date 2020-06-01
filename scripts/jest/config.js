module.exports = {
  transform: {
    '.*': [
      'babel-jest', {
        presets: [
          ['@babel/preset-env', {
            modules: 'commonjs',
          }],
        ],
      },
    ],
  },
  rootDir: process.cwd(),
};
