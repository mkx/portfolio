angular.module('portfolioApp.unauthorized', [
    'gapi',
    'ui.router'
])
        .config(
                ['$stateProvider',
                    function ($stateProvider) {
                        $stateProvider
                                .state('unauthorized', {
                                    url: '/',
                                    templateUrl: 'unauthorized/unauthorized.html',
                                    controller: 'UnauthorizedCtrl'
                                });
                    }
                ])
        .controller('UnauthorizedCtrl',
                ['$scope', 'gapiService',
                    // Controller
                    function ($scope, gapiService) {
                        $scope.authorize = function() {
                            gapiService.authorize();
                        };

                    }]
                );






