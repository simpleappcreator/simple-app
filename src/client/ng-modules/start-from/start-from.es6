angular.module('startFrom', []).
filter('startFrom', () => (input, start) => input.slice(+start));
