angular.module('startFrom', []).
filter('startFrom', function () {
    return function (input, start) {
        start = +start; //parse to int
        return input.slice(start);};});
//# sourceMappingURL=start-from.js.map
