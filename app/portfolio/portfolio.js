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
                        
                        $scope.positions = new Array();
                        $scope.transactions = new Array();
                        $scope.portfolio = portfolio;
                        
                        $scope.yahooTriggered = false;

                        spreadsheetService.loadSpreadsheet($rootScope.sheetContentSrc);
                        $scope.sheets = spreadsheetService.data;
                        
                        // start yahoo interval
                        var yahooLoader;
                        
                        if (!angular.isDefined(yahooLoader)) {
                            yahooLoader = $interval(function() {
                                $scope.queryYahoo();
                            }, 500 /*ms*/);
                        }
                        
                        $scope.stopYahoo = function() {
                            if (angular.isDefined(yahooLoader)) {
                                $interval.cancel(yahooLoader);
                                yahooLoader = undefined;
                            }
                        };
                        
                        $scope.$on('$destroy', function() {
                            $scope.stopYahoo();
                        });
                        
                        // applies yahoo stock data to position
                        var updatePosition = function(quote) {
                            var symbol = yahooService.mapSymbol(quote.symbol);
                            portfolio.updateQuoteYahoo(symbol, quote);
                        };                        
                        
                        $scope.queryYahoo = function() {
                            if ($scope.yahooTriggered) {
                                $scope.stopYahoo();
                                return;
                            }
                            
                            if ($scope.sheets.worksheetsFound > 0 &&
                                    $scope.sheets.worksheetsFound === $scope.sheets.worksheetsLoaded) {
                                // start query to yahoo
                                var symbols = portfolio.getSymbols();
                                var len = symbols.length;
                                var yahooSymbols = Array();
                                for (var i = 0; i < len; i++) {
                                    var yahooSymbol = yahooService.mapYahoo(symbols[i]);
                                    if (yahooSymbol) {
                                        yahooSymbols.push(yahooSymbol);
                                    }
                                }
                                if (yahooSymbols.length === 0) {
                                    // retry later
                                    return ;
                                }
                                yahooService.getQuotes(yahooSymbols).success(function (data) {
                                    var quote = data.query.results.quote;
                                    for (var i=quote.length-1; i>=0; i--) {
                                        updatePosition(quote[i]);
                                    }
                                }).error(function (data, status, headers, config) {
                                    console.log('Error: ' + status);
                                });
                                
                                $scope.yahooTriggered = true;
                                $scope.stopYahoo();
                            }
                        };
                   }])
        .controller('PortfolioPositionCtrl',
                ['$scope', '$state', '$stateParams', '$http', 'gapiService', 'yahooService',
                    function ($scope, $state, $stateParams, $http, gapiService, yahooService) {
                        if (!$scope.positions) {
                            $state.go('portfolio');
                            return;
                        }
                        
                        $scope.position = undefined;
                        
                        var len = $scope.positions.length;
                        for (var i=0; i<len; i++) {
                            if ($scope.positions[i].symbol === $stateParams.positionId) {
                                $scope.position = $scope.positions[i];
                                $scope.symbol = $stateParams.positionId;
                                break;
                            }
                        }
                        
                        if (!$scope.position) {
                            $state.go('portfolio');
                            return;
                        }
                        
                        $scope.filteredTransactions = Array();
                        $scope.filteredEarnings = Array();
                        var oldest = moment();
                        len = $scope.transactions.length;
                        for (var i=0; i<len; i++) {
                            if ($scope.transactions[i].symbol === $scope.symbol) {
                                if ($scope.transactions[i].type === "BUY") {
                                    $scope.filteredTransactions.push($scope.transactions[i]);
                                } else if ($scope.transactions[i].type === "Kupon") {
                                    $scope.filteredEarnings.push($scope.transactions[i]);
                                }
                                if ($scope.transactions[i].valuta &&
                                        $scope.transactions[i].valuta.isBefore(oldest)) {
                                    oldest = $scope.transactions[i].valuta;
                                }
                            }
                        }

                        // load chart data
                        var yahooSymbol = yahooService.mapYahoo($scope.symbol);
                        if (yahooSymbol) {
                            var endDate = moment().format('YYYY-MM-DD');
                            var startDate = oldest.format('YYYY-MM-DD');
                            yahooService.getHistoricalData(yahooSymbol, startDate, endDate).success(function (data) {
                                var quote = data.query.results.quote;
                                d3plus.viz()
                                        .container("#chart")
                                        .data(quote)
                                        .type("line")
                                        .id("Symbol")
                                        .text("Adj_Close")
                                        .y(function(d) {
                                            return parseFloat(d.Adj_Close);
                                        })
                                        .x({
                                            grid: false,
                                            value: "Date"
                                        })
                                        .time("Date")
                                        .draw();
                            }).error(function (data, status, headers, config) {
                                console.log('Error: ' + status);
                            });
                        }
                        
                    }]);