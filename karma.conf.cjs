module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['mocha'],
    files: [
      { pattern: 'test/importmap.js', watched: false },
      { pattern: 'node_modules/chai/index.js', type: 'module' },
      { pattern: 'node_modules/immer/dist/immer.production.mjs', type: 'module', included: false },
      { pattern: 'node_modules/mustache/mustache.mjs', type: 'module', included: false },
      { pattern: 'node_modules/@zumer/snapdom/dist/snapdom.mjs', type: 'module', included: false },
      { pattern: 'util/**/*.mjs', type: 'module' },
      { pattern: 'router/**/*.mjs', type: 'module' },
      { pattern: 'model/**/*.mjs', type: 'module' },
      { pattern: 'service/**/*.mjs', type: 'module' },
      { pattern: 'repository/**/*.mjs', type: 'module' },
      { pattern: 'adapter/**/*.mjs', type: 'module' },
      { pattern: 'test/**/*.test.mjs', type: 'module' }
    ],
    exclude: [],
    preprocessors: {},
    reporters: ['mocha'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['FirefoxHeadless'],
    singleRun: true,
    concurrency: Infinity,
    plugins: [
      'karma-mocha',
      'karma-firefox-launcher',
      'karma-mocha-reporter'
    ]
  })
}
