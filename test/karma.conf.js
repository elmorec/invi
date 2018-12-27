module.exports = function (config) {
  config.set({
    basePath: '.',
    frameworks: ['jasmine'],
    files: [
      './scripts/style.css',
      './scripts/helpers.js',
      '../node_modules/zepto/dist/zepto.js',
      '../dist/index.js',
      './scripts/utils.js',
      './scripts/components/toast.js',
      './scripts/components/modal.js',
      './scripts/components/tab.js',
      './scripts/components/carousel.js',
      './scripts/components/collapsible.js',
    ],
    browsers: [typeof process.env.TRAVIS_JOB_ID !== 'undefined' ? 'ChromeHeadless' : 'Chrome'],
    port: 9876,
    colors: true,
    singleRun: true,
    concurrency: Infinity,
    client: {
      jasmine: {
        timeoutInterval: 10000
      }
    }
  });
};
