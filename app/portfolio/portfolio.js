angular.module('portfolioApp.portfolio', [
    'gapi',
    'portfolioModule',
    'ngStorage',
    'ui.router',
    'spreadsheetModule',
    'yahooModule'
])

        .config(
                ['$stateProvider',
                    function ($stateProvider) {
                        $stateProvider
                        .state('portfolio', {
                            url: '/portfolio',
                            templateUrl: 'portfolio/portfolio.html',
                            controller: 'PortfolioCtrl',
                            resolve: {
                                promiseToken: function(gapiService) {
                                    return gapiService.promiseToken();
                                }
                            }
                        })
                        .state('portfolio.transactions', {
                            url: '/transactions',
                            templateUrl: 'portfolio/transactions.html'
                        })
                        .state('portfolio.positions', {
                            url: '/positions',
                            templateUrl: 'portfolio/positions.html'
                        })
                        .state('portfolio.position', {
                            url: '/:positionId',
                            templateUrl: 'portfolio/position.html',
                            controller: 'PortfolioPositionCtrl'
                        });
                    }])
        .controller('PortfolioCtrl',
                [
                    '$scope',
                    '$state',
                    '$rootScope',
                    '$http',
                    '$localStorage',
                    '$interval',
                    'portfolio',
                    'gapiService',
                    'yahooService',
                    'spreadsheetService',
                    function ($scope, $state, $rootScope, $http, $localStorage,
                        $interval,
                        portfolio, gapiService, yahooService, spreadsheetService) {
                        /*if (!gapiService.getToken()) {
                            $state.go('unauthorized');
                            return;
                        }*/
                        
                        $scope.$storage = $localStorage;
                        
                        // check if we already know about a sheet url
                        if (!$rootScope.sheetContentSrc) {
                            if ($scope.$storage.sheetContentSrc) {
                                $rootScope.sheetContentSrc = $scope.$storage.sheetContentSrc;
                            } else {
                                $state.go('sheets');
                                return;
                            }
                        } else {
                            $scope.$storage.sheetContentSrc = $rootScope.sheetContentSrc;
                        }
                        
                        $scope.positions = portfolio.getPositions();
                        $scope.portfolio = portfolio;
                        
                        $scope.orderProp = function(p) {
                            if (p.performance) {
                                return parseFloat(p.performance.toString());
                            } else {
                                return p.performance;
                            }
                        };
                        $scope.orderByPerfDesc = function(p) {
                            if (p.performance) {
                                return -parseFloat(p.performance.toString());
                            } else {
                                return p.performance;
                            }
                        };
                        
                        spreadsheetService.loadSpreadsheet($rootScope.sheetContentSrc);
                        $scope.sheets = spreadsheetService.data;
                        
                   }])
        .controller('PortfolioPositionCtrl',
                [
                    '$scope',
                    '$state',
                    '$stateParams',
                    '$http',
                    'gapiService',
                    'yahooService',
                    'portfolio',
                    function (
                            $scope,
                            $state,
                            $stateParams,
                            $http,
                            gapiService,
                            yahooService,
                            portfolio) {
                        
                        $scope.positions = portfolio.getPositions();
                        $scope.portfolio = portfolio;

                        $scope.position = portfolio.findPosition($stateParams.positionId);
                        
                        if (!$scope.position) {
                            $state.go('portfolio');
                            return;
                        }
                        $scope.symbol = $scope.position.symbol;
                        
                        $scope.filteredTransactions = 
                                $scope.position.getTransactionsByType(['BUY', 'SELL']);
                        $scope.filteredEarnings =
                                $scope.position.getTransactionsByType('Kupon');
                        
                    }]);