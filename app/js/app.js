'use strict';

/* App Module */

var portfolioApp = angular.module('portfolioApp', [
    'ngAnimate',
    'ngRoute',
    'ngStorage',
  'portfolioApp.portfolio',
  'portfolioApp.sheets',
  'portfolioApp.unauthorized',
  'ui.router'
]);


portfolioApp.config(
  [ '$urlRouterProvider',
    function ($urlRouterProvider) {

      $urlRouterProvider.otherwise('/');
              
  }]);

