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
    this.name = quote.Name;
    this.changePrevDay = null;
    this.changePrevDayRel = null;
    
    this.isValid = function () {
        return this.lastPrice && this.lastPrice.cmp(0) !== 0;
    };
}

function Position(symbol) {
    this.symbol = symbol;
    
    this.quote = null;
    this.transactions = Array();
    
    this.shares = Big(0);
    this.costs = Big(0);
    this.value = Big(0); // shares * quote.LastTradingPrice
    
    this.oldSymbols = Array();
    
    // sort by valuta (date) desc
    this.insertSorted = function(transaction) {
        var len = this.transactions.length;
        if (len === 0) {
            this.transactions.push(transaction);
            return;
        }

        var i = 0;
        while (i < len) {
            var t = this.transactions[i];
            if (t.dateValuta.isBefore(transaction.dateValuta)) {
                this.transactions.splice(i, 0, transaction);
                return;
            }
            i++;
        }
        
        this.transactions.push(transaction);
    };
    
    this.addTransaction = function(transaction) {
        // insert sorted
        this.insertSorted(transaction);
        this.shares = this.shares.plus(transaction.shares);
        this.costs = this.costs.plus(transaction.costs);
        this.recalc();
    };

    this.updateQuoteYahoo = function(quote) {
        this.quote = new Quote(quote);
        this.recalc();
    };
    
    this.updateHistoricalData = function(quotes) {
        this.historicalPrices = quotes;
        this.buildHistoricalData();
    };
    
    // returns number of shares hold at date
    this.getHistoricalShares = function(date) {
        if (!moment.isMoment(date)) {
            date = moment(date);
        }
        var result = Big(0);
        this.transactions.forEach(function(t) {
            if (t.dateValuta.isBefore(date, 'day') ||
                    t.dateValuta.isSame(date, 'day')) {
                result = result.plus(t.shares);
            }
        });
        return result;
    };

    this.getHistoricalCosts = function(date) {
        if (!moment.isMoment(date)) {
            date = moment(date);
        }
        var result = Big(0);
        this.transactions.forEach(function(t) {
            if (t.dateValuta.isBefore(date, 'day') ||
                    t.dateValuta.isSame(date, 'day')) {
                result = result.plus(t.costs);
            }
        });
        return result;
    };
    
    // build an array of accumulated costs 
    // and historical value 
    this.buildHistoricalData = function() {
        this.historicalPrices.forEach(function (q) {
            q.shares = this.getHistoricalShares(q.Date);
            if (q.Adj_Close) {
                q.value = parseFloat(q.shares.times(q.Adj_Close).toString());
            } else {
                q.value = 0.0;
            }
            q.costs = this.getHistoricalCosts(q.Date);
        }, this);
    };
    
    this.recalc = function() {
        if (this.quote) {
            this.value = this.quote.lastPrice.times(this.shares);
            this.performance = portfolioCalcPerformance(this.value, this.costs);
        }
    };
    
    this.getTransactionsByType = function(types) {
        if (!Array.isArray(types)) {
            types = [types];
        }
        
        return this.transactions.filter(function(t) {
            return (types.indexOf(t.type) !== -1);
        });
    };
    
    // looks up a transaction that is the reverse of 
    // the transaction received as a param
    this.findReverseTransaction = function(transaction) {
        var list = this.transactions.filter(function(t) {
            return (transaction.shares.plus(t.shares).cmp(0) === 0 
                    && t.costs.cmp(0) === 0
                    && transaction.dateValuta.isSame(t.dateValuta, 'day'));
        });
        if (list.length) {
            return list[0];
        }
        return null;
    };

    this.merge = function(oldPos) {
        oldPos.transactions.forEach(function (t) {
            this.addTransaction(t);
        }, this);
        this.oldSymbols.push(oldPos.symbol);
    };
}

function Portfolio(currency) {
    // 
    this.currency = currency;
    
    this.costs = Big(0);
    this.value = Big(0);
    this.costsWithoutValue = Big(0);
    this.costsTotal = Big(0);
    this.performance = null;
    
    this.positions = Array();
    
    
    this.chartData = Array();
    
    // redirects old symbols to new symbols
    this.symbolMap = {};   
    
    this.findPosition = function(symbol) {
        if (this.symbolMap[symbol]) {
            symbol = this.symbolMap[symbol];
        }
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
    
    this.findReverseTransaction = function(transaction) {
        var t2 = null;
        this.positions.forEach(function(position) { 
            var res = position.findReverseTransaction(transaction);
            if (res) {
                t2 = res;
            }
        });
        return t2;
    };
    
    this.deletePosition = function(symbol) {
        for (var i=this.positions.length-1; i>=0; i--) {
            if (this.positions[i].symbol === symbol) {
                this.positions.splice(i, 1);
                return;
            }
        }
    };
    
    this.mergePositions = function(newSymbol, oldSymbol) {
        var oldPos = this.findPosition(oldSymbol);
        if (oldPos) {
            var newPos = this.findOrCreatePosition(newSymbol);
            newPos.merge(oldPos);
            this.deletePosition(oldSymbol);
        }
        this.symbolMap[oldSymbol] = newSymbol;
    };
    
    // find position and add transaction there
    this.addTransaction = function(transaction) {
        var t = transaction;
        if (transaction instanceof Transaction) {
            // nothing to do
        } else {
            t = new Transaction(transaction);
        }
        
        // check for symbol chg
        if (t.costs.cmp(0) === 0) {
            // sold or bought, but not for money?
            var t2 = this.findReverseTransaction(t);
            if (t2) {
                if (t.shares.cmp(0) < 0) {
                    // t2 is the 'new' one
                    this.mergePositions(t2.symbol, t.symbol);
                } else {
                    this.mergePositions(t.symbol, t2.symbol);
                }
            }
        }

        var position = this.findOrCreatePosition(t.symbol);
        position.addTransaction(t);
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
        this.value = Big(0);
        this.costsWithoutValue = Big(0);
        for (var i = this.positions.length - 1; i >= 0; i--) {
            var p = this.positions[i];
            if (p.quote && p.quote.isValid()) {
                this.costs = this.costs.plus(p.costs);
                this.value = this.value.plus(p.value);
            } else {
                this.costsWithoutValue = this.costsWithoutValue.plus(p.costs);
            }
        }
        this.performance = portfolioCalcPerformance(this.value, this.costs);
        this.costsTotal = this.costs.plus(this.costsWithoutValue);
        
        var chartData = new Array();
        this.positions.forEach(function(p){
            if (p.historicalPrices) {
                chartData = chartData.concat(p.historicalPrices);
            }
        });
        this.chartData = chartData;
    };



    this.getPositions = function () {
        return this.positions;
    };

}



var portfolioModule = angular.module('portfolioModule', []);

portfolioModule.factory('portfolio', function() {
    var portfolioService = new Portfolio('EUR');
    return portfolioService;
});

