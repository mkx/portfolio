
describe("Portfolio service", function() {
  var portfolio = new Portfolio('EUR');

  it("currency is set", function() {
    expect(portfolio.currency).toBe('EUR');
  });
  
  var transactions = [
        {
            symbol: 'ABCDEFG',
            execution: moment().subtract(7, 'days'),
            valuta: moment().subtract(9, 'days'),
            stocks: Big(12),
            value: Big(2.30 * 12),
            price: Big(2.30),
            label: 'some random text',
            currency: 'EUR',
            type: 'BUY'
        },
        {
            symbol: 'ABCDEFG',
            execution: moment().subtract(27, 'days'),
            valuta: moment().subtract(29, 'days'),
            stocks: Big(1),
            value: Big(2.10 * 1),
            price: Big(2.10),
            label: 'some random text',
            currency: 'EUR',
            type: 'BUY'
        },
        {
            symbol: 'ABCDEFG',
            execution: moment().subtract(17, 'days'),
            valuta: moment().subtract(19, 'days'),
            stocks: Big(5),
            value: Big(2.20 * 5),
            price: Big(2.20),
            label: 'some other random text',
            currency: 'EUR',
            type: 'BUY'
        }
    ];
    
    it('adds (raw) transactions', function() {
       portfolio.addTransaction(transactions[0]);
       expect(portfolio.findPosition('ABCDEFG').transactions.length).toBe(1);
       portfolio.addTransaction(transactions[1]);
       expect(portfolio.findPosition('ABCDEFG').transactions.length).toBe(2);
    });
    
    it('does return undef on wrong symbol', function() {
       expect(portfolio.findPosition('XYZ123')).toBe(null);
    });
    
    it('deletes a position', function() {
       expect(portfolio.findPosition('ABCDEFG').symbol).toBe('ABCDEFG');
       portfolio.deletePosition('ABCDEFG');
       expect(portfolio.findPosition('ABCDEFG')).toBe(null);
    });
    
    // dont trust portfolio anymore
    
    it('sorts transactions correctly', function() {
       var p = new Portfolio('EUR');
       transactions.forEach(function(t) { p.addTransaction(t); } );
       var pos = p.findPosition('ABCDEFG');
       expect(pos.transactions.length).toBe(transactions.length);
       var ts = pos.getTransactionsByType('BUY');
       expect(ts.length).toBe(transactions.length);
       for (var i=0; i<ts.length-1; i++) {
           expect(ts[i].dateValuta.isAfter(ts[i+1].dateValuta)).toBe(true);
       }
    });
    
    it('counts historical shares correctly', function() {
       var p = new Portfolio('EUR');
       transactions.forEach(function(t) { p.addTransaction(t); } );
       var pos = p.findPosition('ABCDEFG');
       // on the day, the new shares do count
       expect(pos.getHistoricalShares(moment().subtract(18, 'days')).toString()).toBe('6');
       expect(pos.getHistoricalShares(moment().subtract(19, 'days')).toString()).toBe('6');
       expect(pos.getHistoricalShares(moment().subtract(20, 'days')).toString()).toBe('1');
       expect(pos.getHistoricalShares(moment().subtract(107, 'days')).toString()).toBe('0');
       expect(pos.getHistoricalShares(moment().subtract(1, 'days')).toString()).toBe('18');
       expect(pos.getHistoricalCosts(moment().subtract(18, 'days')).toString()).toBe('13.1');
       expect(pos.getHistoricalCosts(moment().subtract(19, 'days')).toString()).toBe('13.1');
       expect(pos.getHistoricalCosts(moment().subtract(20, 'days')).toString()).toBe('2.1');
    });
});
    
describe('Portfolio mergers', function () {
    var transactions = [
        {
            symbol: 'Old',
            execution: moment().subtract(37, 'days'),
            valuta: moment().subtract(39, 'days'),
            stocks: Big(12),
            value: Big(2.30 * 12),
            price: Big(2.30),
            label: 'some random text',
            currency: 'EUR',
            type: 'BUY'
        },
        {
            symbol: 'Old',
            execution: moment().subtract(27, 'days'),
            valuta: moment().subtract(29, 'days'),
            stocks: Big(-12),
            value: Big(0),
            price: Big(0),
            label: 'should match transaction 2',
            currency: 'EUR',
            type: 'BUY'
        },
        {
            symbol: 'New',
            execution: moment().subtract(27, 'days'),
            valuta: moment().subtract(29, 'days'),
            stocks: Big(12),
            value: Big(0),
            price: Big(2.10),
            label: 'should match transaction 1',
            currency: 'EUR',
            type: 'BUY'
        },
        {
            symbol: 'New',
            execution: moment().subtract(17, 'days'),
            valuta: moment().subtract(19, 'days'),
            stocks: Big(5),
            value: Big(2.20 * 5),
            price: Big(2.20),
            label: 'some other random text',
            currency: 'EUR',
            type: 'BUY'
        }
    ];
    
    it('finds the reverse transaction', function() {
       var p = new Portfolio('EUR');
       p.addTransaction(transactions[1]);
       var t2 = new Transaction(transactions[2]);
       expect(p.findReverseTransaction(t2).symbol).toBe(transactions[1].symbol);
    });
    
    it('finds the reverse transaction (reverse)', function() {
       var p = new Portfolio('EUR');
       p.addTransaction(transactions[2]);
       var t2 = new Transaction(transactions[1]);
       expect(p.findReverseTransaction(t2).symbol).toBe(transactions[2].symbol);
    });
    
    it('merges symbols on symbol change', function() {
       var p = new Portfolio('EUR');
       transactions.forEach(function(t) { p.addTransaction(t); } );
       var pos = p.findPosition('New');
       expect(pos.transactions.length).toBe(transactions.length);
       expect(p.findPosition('Old').symbol).toBe('New');
       expect(p.findPosition('Old').transactions.length).toBe(transactions.length);
    });
});


