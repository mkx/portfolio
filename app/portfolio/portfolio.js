angular.module('portfolioApp.portfolio', [
    'ngStorage',
    'ui.router'
])

        .config(
                ['$stateProvider',
                    function ($stateProvider) {
                        $stateProvider
                        .state('portfolio', {
                            url: '/portfolio',
                            views: {
                                '': {
                                    templateUrl: 'portfolio/portfolio.html',
                                    controller: 'PortfolioCtrl'
                                },
                                'portfolioTabs': {
                                    template: 'Test'
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
                        });
                    }])
        .controller('PortfolioCtrl',
                ['$scope', '$state', '$rootScope', '$http', '$localStorage',
                    function ($scope, $state, $rootScope, $http, $localStorage) {
                        if (!$rootScope.token) {
                            $state.go('unauthorized');
                            return;
                        }
                        
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
                        $scope.portfolio = {
                            price: new Big(0),
                            value: new Big(0)
                        };
                        $scope.mappingSymbolYahoo = {};
                        $scope.mappingYahooSymbol = {};
                        
                        $scope.worksheetsFound = 0;
                        $scope.worksheetsLoaded = 0;
                        $scope.yahooTriggered = false;

                        // load data from spreadsheet
                        var url = $rootScope.sheetContentSrc;
                        var config = {
                            method: 'JSONP',
                            url: url,
                            params: {
                                v: '3.0',
                                access_token: $rootScope.token.access_token,
                                callback: 'JSON_CALLBACK'
                            }
                        };
                        $http(config).
                        success(function(data) {
                            x2js = new X2JS();                            
                            var result = x2js.xml_str2json(data);
                            var worksheets = result.feed.entry;
                            var len = worksheets.length;
                            $scope.worksheetsFound = len;
                            for (var i=0; i<len; i++){
                                // start loading all the worksheets
                                var url = worksheets[i].content._src;
                                var config = {
                                    method: 'JSONP',
                                    url: url,
                                    params: {
                                        v: '3.0',
                                        access_token: $rootScope.token.access_token,
                                        callback: 'JSON_CALLBACK'
                                    }
                                };
                                $http(config).
                                success(function(data) {
                                    x2js = new X2JS();                            
                                    var result = x2js.xml_str2json(data);
                                    var rows = result.feed.entry;
                                    var len = rows.length;
                                    for(var i=0; i<len; i++) {
                                        var row = rows[i];
                                        if (!row.symbol.__text) {
                                            // TODO make this work w/o relying
                                            // on internals
                                            continue;
                                        }
                                        
                                        if (row.yahoo) {
                                            // this is part of the mapping table
                                            $scope.mappingSymbolYahoo[row.symbol.toString()] =
                                                    row.yahoo.toString();
                                            $scope.mappingYahooSymbol[row.yahoo.toString()] =
                                                    row.symbol.toString();
                                            continue;
                                        }
                                        
                                        var convertToBig = function(number) {
                                            if (!number) {
                                                return Big(0);
                                            }
                                            var val = number.toString();
                                            if (val.indexOf(',') !== -1 &&
                                                    val.indexOf('.') === -1) {
                                                // simple conversion from German to US
                                                val = val.replace(',', '.');
                                            }
                                            var regex = new RegExp("[-0-9.]+");
                                            return Big(regex.exec(val));
                                        };
                                        convertToDate = function (date) {
                                            if (!date) {
                                                return null;
                                            }
                                            var val = date.toString();
                                            if (val.indexOf('.') !== -1) {
                                                result = moment(val, "DD.MM.YYYY");
                                                if (result.isValid()) {
                                                    return result;
                                                } // else try default conversion
                                            }
                                            return moment(val);  
                                        };
                                        var transaction = {
                                            type: row.type && row.type.toString() || 'BUY',
                                            valuta: convertToDate(row.valuta),
                                            execution: convertToDate(row.execution),
                                            label: row.label.toString(),
                                            value: convertToBig(row.value),
                                            symbol: row.symbol.toString(),
                                            stocks: convertToBig(row.stocks),
                                            currency: row.currency && row.currency.toString(),
                                            price: convertToBig(row.price)
                                        };
                                        $scope.addTransaction(transaction);
                                    }
                                    $scope.worksheetsLoaded++;
                                    $scope.queryYahoo();
                                }).error(function(data, status, headers, config) {
                                    console.log('Error: ' + status);
                                });
                            }
                        }).
                        error(function(data, status, headers, config) {
                           console.log('Error: ' + status);
                        });
                        
                        $scope.addTransaction = function(transaction) {
                            $scope.transactions.push(transaction);
                            // and update the position array

                            var len = $scope.positions.length;
                            var updated = false;
                            for (var i=0; i<len; i++) {
                                if ($scope.positions[i].symbol === transaction.symbol) {
                                    $scope.positions[i].stocks = 
                                            $scope.positions[i].stocks.plus(transaction.stocks);
                                    $scope.positions[i].value =
                                            $scope.positions[i].value.plus(transaction.value);
                                    updated = true;
                                    break;
                                }
                            }
                            if (!updated) {
                                // add
                                var position = {
                                    symbol: transaction.symbol,
                                    stocks: transaction.stocks,
                                    value: transaction.value,
                                    lastTradingPrice: undefined
                                };
                                $scope.positions.push(position);
                                
                            }
                            // update portfolio
                            $scope.portfolio.value = $scope.portfolio.value.plus(transaction.value);
                        };
                        
                        // applies yahoo stock data to position
                        $scope.updatePosition = function(quote) {
                            var len = $scope.positions.length;
                            var symbol = $scope.mappingYahooSymbol[quote.symbol];
                            for (var i=0; i<len; i++) {
                                if ($scope.positions[i].symbol === symbol) {
                                    $scope.positions[i].lastTradingPrice = 
                                            Big(quote.LastTradePriceOnly);
                                    $scope.positions[i].quote = quote;
                                    continue;
                                }
                            }
                            $scope.recalcPerformance();
                        };
                        
                        $scope.recalcPerformance = function() {
                            $scope.queryYahoo();
                            
                            var len = $scope.positions.length;
                            var totalPrice = Big(0);
                            for (var i=0;i<len;i++) {
                                if ($scope.positions[i].lastTradingPrice) {
                                    $scope.positions[i].currentValue = 
                                        $scope.positions[i].lastTradingPrice.times(
                                        $scope.positions[i].stocks
                                        );
                                    totalPrice = 
                                            totalPrice.plus($scope.positions[i].currentValue);
                                } else {
                                    $scope.positions[i].currentValue = undefined;
                                }
                            }
                            $scope.portfolio.price = totalPrice;
                            
                            var p = $scope.portfolio;
                            $scope.portfolio.performance = 
                                    p.price.minus(p.value).div(p.value).times(100);
                        };
                        
                        $scope.queryYahoo = function() {
                            if ($scope.yahooTriggered) {
                                return;
                            }
                            
                            if ($scope.worksheetsFound > 0 &&
                                    $scope.worksheetsFound === $scope.worksheetsLoaded) {
                                // start query to yahoo
                                var len = $scope.positions.length;
                                for (var i = 0; i < len; i++) {
                                    var yahooSymbol = $scope.mappingSymbolYahoo[$scope.positions[i].symbol];
                                    if (yahooSymbol) {
                                        var config = {
                                            method: 'JSONP',
                                            url: 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quote%20where%20symbol%20in%20(%22' + yahooSymbol + '%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=JSON_CALLBACK'
                                        };
                                        $http(config).success(function (data) {
                                            var quote = data.query.results.quote;
                                            $scope.updatePosition(quote);
                                        }).error(function (data, status, headers, config) {
                                            console.log('Error: ' + status);
                                        });
                                    }
                                }
                                
                                $scope.yahooTriggered = true;
                            }
                        };
                    }]);