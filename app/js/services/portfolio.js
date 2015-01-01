/* portfolio and related classes + service */


portfolioCalcPerformance = function(current, base) {
    if (!current || !base || base.cmp(0) === 0) {
        return NaN;
    }
    return current.minus(base).div(base).times(100);
};



function Transaction(rawData) {
    this.symbol = rawData.symbol;
    this.dateExecution = rawData.execution;
    this.dateValuta = rawData.valuta;
    this.shares = rawData.stocks;
    this.costs = rawData.value;
    this.price = rawData.price;
    
    this.label = rawData.label;
    this.currency = rawData.currency;
        
    this.type = rawData.type;
}

function Quote(quote) {
    this.symbol = quote.symbol; // yahoo symbol!
    this.lastPrice = Big(quote.LastTradePriceOnly);
    this.changePrevDay = null;
    this.changePrevDayRel = null;
}

function Position(symbol) {
    this.symbol = symbol;
    
    this.quote = null;
    this.transactions = Array();
    
    this.shares = Big(0);
    this.costs = Big(0);
    this.value = Big(0); // shares * quote.LastTradingPrice
    
    this.addTransaction = function(transaction) {
        var t = transaction;
        if (transaction instanceof Transaction) {
            // nothing to do
        } else {
            t = new Transaction(transaction);
        }
        this.transactions.push(t);
        this.shares = this.shares.plus(t.shares);
        this.costs = this.costs.plus(t.costs);
        this.recalc();
    };

    this.updateQuoteYahoo = function(quote) {
        this.quote = new Quote(quote);
        this.recalc();
    };
    
    this.recalc = function() {
        if (this.quote) {
            this.value = this.quote.lastPrice.times(this.shares);
            this.performance = portfolioCalcPerformance(this.value, this.costs);
        }
    };

}

function Portfolio(currency) {
    // 
    this.currency = currency;
    
    this.costs = Big(0);
    this.value = Big(0);
    this.performance = null;
    
    this.positions = Array();
    
    
    this.findPosition = function(symbol) {
        for (var i=this.positions.length-1; i>=0; i--) {
            if (this.positions[i].symbol === symbol) {
                return this.positions[i];
            }
        }
        return null;
    };
    
    this.findOrCreatePosition = function(symbol) {
        var position = this.findPosition(symbol);
        if (!position) {
            position = new Position(symbol);
            this.positions.push(position);
        }
        return position;
    };
    
    // find position and add transaction there
    this.addTransaction = function(transaction) {
        var position = this.findOrCreatePosition(transaction.symbol);
        position.addTransaction(transaction);
        this.recalc();
    };

    this.updateQuoteYahoo = function (symbol, quote) {
        var position = this.findOrCreatePosition(symbol);
        position.updateQuoteYahoo(quote);
        this.recalc();
    };

    this.getSymbols = function() {
        var result = Array();
        for (var i = this.positions.length - 1; i >= 0; i--) {
            result.push(this.positions[i].symbol);
        }
        return result;
    };
    
    this.recalc = function () {
        this.costs = Big(0);
        for (var i = this.positions.length - 1; i >= 0; i--) {
            var p = this.positions[i];
            this.costs = this.costs.plus(p.costs);
            this.value = this.value.plus(p.value);
        }
        this.performance = portfolioCalcPerformance(this.value, this.costs);
    };


}



var portfolioModule = angular.module('portfolioModule', []);

portfolioModule.factory('portfolio', function() {
    var portfolioService = new Portfolio();
    return portfolioService;
});

