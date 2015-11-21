function ngDirective(name, linkFn, options) {
    var kebabCase = _.kebabCase(name);
    var camelCase = _.camelCase(name);
    var defaults = { 
        restrict: 'E', 
        scope: true, 
        transclude: true, 
        templateUrl: '/ng-modules/' + kebabCase + '/' + kebabCase, 
        deps: [] };

    options = _.extend(defaults, options || {});
    options.link = linkFn;
    return angular.module(camelCase, options.deps).
    directive(camelCase, function () {
        return options;});}
//# sourceMappingURL=create-ng-directive.js.map
