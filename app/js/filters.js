angular.module('portfolioApp')
        .filter('bigNum', function() {
            return function(input, precision) {
                if (!input) {
                    return '';
                }
                if (input instanceof Big) {
                    return input.toFixed(precision);
                }
                return input;
            };
})
        .filter('momentCalendar', function() {
            return function(input) {
                if (!input) {
                    return '';
                }
                if (moment.isMoment(input)) {
                    return input.calendar();
                }
                return input;
            };
})
        .filter('momentFromNow', function() {
            return function(input) {
                if (!input) {
                    return '';
                }
                if (moment.isMoment(input)) {
                    return input.fromNow();
                }
                return input;
            };
});