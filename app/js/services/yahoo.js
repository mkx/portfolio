function YahooService($http, $q) {
    
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
 
    
    
}

angular.module('yahooModule', []).service('yahooService',
        [
            '$http',
            '$q',
            YahooService
        ]);


