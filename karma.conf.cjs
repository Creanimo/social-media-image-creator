module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['mocha'],
    files: [
      { pattern: 'node_modules/chai/index.js', type: 'module' },
      { pattern: 'util/**/*.mjs', type: 'module' },
      { pattern: 'test/**/*.test.mjs', type: 'module' }
    ],
    exclude: [],
    preprocessors: {},
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['FirefoxHeadless'],
    singleRun: true,
    concurrency: Infinity,
    plugins: [
      'karma-mocha',
      'karma-firefox-launcher'
    ]
  })
}
