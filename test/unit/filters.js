describe('filter', function () {

    beforeEach(module('portfolioApp'));

    describe('percent', function () {

        it('should convert Big percent to percent string',
                inject(function (percentFilter) {
                    var percentSuffix = ' %';
                    expect(percentFilter(0)).toBe('0' + percentSuffix);
                    expect(percentFilter(Big(0))).toBe('0' + percentSuffix);
                    expect(percentFilter(Big(0), 2)).toBe('0.00' + percentSuffix);

                    expect(percentFilter(Big(-0.02), 2)).toBe('-2.00' + percentSuffix);
                    expect(percentFilter(Big(2.123))).toBe('212.3' + percentSuffix);
                    expect(percentFilter(Big(0.123), 0)).toBe('12' + percentSuffix);
                }));
    });
});