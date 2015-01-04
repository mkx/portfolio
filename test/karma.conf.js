module.exports = function(config){
  config.set({

    basePath : '../',

    files : [
      'app/bower_components/angular/angular.js',
      'app/bower_components/angular-route/angular-route.js',
      'app/bower_components/angular-resource/angular-resource.js',
      'app/bower_components/angular-animate/angular-animate.js',
      'app/bower_components/angular-mocks/angular-mocks.js',
      "app/bower_components/angular-ui-router/release/angular-ui-router.min.js",
      'app/bower_components/ngstorage/ngStorage.min.js',
      'app/bower_components/big.js/big.min.js',
      'app/bower_components/moment/min/moment-with-locales.min.js',
      'app/bower_components/moment-range/lib/moment-range.min.js',
      'app/bower_components/x2js/xml2json.min.js',
      'app/js/**/*.js',
      'app/portfolio/*.js',
      'app/unauthorized/*.js',
      'app/sheets/*.js',
      'test/unit/**/*.js'
    ],

    autoWatch : true,

    frameworks: ['jasmine'],

    browsers : ['Firefox'],

    plugins : [
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-jasmine'
            ],

    junitReporter : {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    }

  });
};