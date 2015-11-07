new ngDirective('paginate', function paginate($scope, element, attrs) {

    if ($scope.data && $scope.data.length) {
        var singular = 'data'
        var plural = 'data'
        var limited = 'limitedData';
        var filtered = 'filteredData';
    } else if ($scope.dataName || attrs.directive) {
        if (attrs.directive) $scope.dataName = attrs.directive;
        var singular = $scope.dataName.toLowerCase();
        var plural = singular + 's';
        var limited = 'limited' + _.capitalize(singular) + 's';
        var filtered = 'filtered' + _.capitalize(singular) + 's';
    } else return console.debug('Paginate needs $scope.data or $scope.dataName');

    $scope.data = $scope[plural];

    $scope.watch('searchText', function(){
        $scope.startFrom = 0;
    });

    if (!$scope.startFrom) $scope.$parent.startFrom = 0;
    if (!$scope.limitTo) $scope.$parent.limitTo = 30;
    // if (!$scope.searchText) $scope.$parent.searchText = '';
    $scope.clearSearchText = function() {
        $scope.searchText = '';
    };

    if (!$scope.filterFn) $scope.$parent.filterFn = function() {
        return function(item) {
            return true;
        };
    };

    if (attrs.directive) {
        var tagStr = '<' + attrs.directive + " ng-repeat='" + singular + " in " + limited + " = (" + filtered + "=(" + plural + "|filter:searchText|filter:filterFn()) | startFrom:startFrom|limitTo:limitTo ) track by " + singular + "._id'></div>";
        // console.debug(tagStr);
        element.append($scope.$compile(tagStr)($scope));
    }
});
