angular.module('fromNow', [])
    .filter('fromNow', function() {
        // var now = new Date().getTime() - (60 * 1000);
        var old = new Date().getTime() - (5 * 12 * 30 * 24 * 60 * 60 * 1000);
        return function fromNow(date) {
            if (!(date instanceof Date)) date = new Date(date);
            date = date.getTime();
            if (date <= old) return 'never';
            // if (date >= now) return 'just now';
            return moment(date).fromNow();
        };
    });
