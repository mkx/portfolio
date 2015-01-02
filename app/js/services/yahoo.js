function YahooService($http, portfolio) {
    
    /* first part: provide a mapping between yahoo real
     * symbol and our portfolio's symbol aka WKN
     */
    this.mappingSymbolYahoo = {};
    this.mappingYahooSymbol = {};
        
    this.mapSymbol = function(yahoo) {
        return this.mappingYahooSymbol[yahoo];
    };
    
    this.mapYahoo = function(symbol) {
        return this.mappingSymbolYahoo[symbol];
    };

    this.addMapping = function(symbol, yahoo) {
        this.mappingSymbolYahoo[symbol] = yahoo;
        this.mappingYahooSymbol[yahoo] = symbol;
    };
    
    
    /* second part: wrap queries to yahoo financial api */

    // param should be an array of yahoo symbols
    this.getQuotes = function(symbols) {
        var config = {
            method: 'JSONP',
            url: 'https://query.yahooapis.com/v1/public/yql?' +
                'q=select%20*%20from%20yahoo.finance.quote%20where%20symbol%20in%20(%22' 
                + symbols.join(',') + '%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=JSON_CALLBACK'
        };
        return $http(config);
    };
    
    this.getHistoricalData = function (symbol, begin, end) {
        var config = {
            url: 'https://query.yahooapis.com/v1/public/yql?' +
                    'q=select%20*%20from%20yahoo.finance.historicaldata%20where%20symbol%20%3D%20%22'
                    + symbol +
                    '%22%20and%20startDate%20%3D%20%22'
                    + begin +
                    '%22%20and%20endDate%20%3D%20%22'
                    + end +
                    '%22&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=JSON_CALLBACK',
            method: 'JSONP'
        };
        return $http(config);
    };
 
    // applies yahoo stock data to position
    var updatePosition = function (quote, yahooService) {
        var symbol = yahooService.mapSymbol(quote.symbol);
        portfolio.updateQuoteYahoo(symbol, quote);
    };
    
    var updateHistoricalData = function(quotes, position) {
        position.updateHistoricalData(quotes);
        portfolio.recalc();
    };

    this.queryYahoo = function () {
        // start query to yahoo
        var symbols = portfolio.getSymbols();
        var len = symbols.length;
        var yahooSymbols = Array();
        for (var i = 0; i < len; i++) {
            var yahooSymbol = this.mapYahoo(symbols[i]);
            if (yahooSymbol) {
                yahooSymbols.push(yahooSymbol);
            }
        }
        if (yahooSymbols.length === 0) {
            // retry later
            return;
        }
        var yahooService = this;
        this.getQuotes(yahooSymbols).success(function (data) {
            var quote = data.query.results.quote;
            for (var i = quote.length - 1; i >= 0; i--) {
                updatePosition(quote[i], yahooService);
            }
        }).error(function (data, status, headers, config) {
            console.log('Error: ' + status);
        });
        
        
        // also query historic values
        portfolio.getPositions().forEach(function(position) {
            var oldest = position.transactions
                            [position.transactions.length-1].dateValuta;

            // load chart data
            var yahooSymbol = yahooService.mapYahoo(position.symbol);
            if (yahooSymbol) {
                var endDate = moment().format('YYYY-MM-DD');
                var startDate = oldest.format('YYYY-MM-DD');
                yahooService.getHistoricalData(yahooSymbol, startDate, endDate)
                .success(function (data) {
                    if (data.query.results && data.query.results.quote) {
                        updateHistoricalData(data.query.results.quote, position);
                    }
                }).error(function (data, status, headers, config) {
                    console.log('Error: ' + status);
                });
            }
        });
  
    };

}

angular.module('yahooModule', []).service('yahooService',
        [
            '$http',
            'portfolio',
            YahooService
        ]);


