new ngDirective('bcMultiple', function bcMultiple($scope, element, attrs) {
    $scope.bc = bc;
    var data = $scope.data = $scope.data || bc.data || window.data || null;
    var refs = $scope.refs = $scope.refs || bc.refs || window.refs || {};
    $scope.startFrom = 0;
    $scope.limitTo = 25;
}, _.extend({
    templateUrl: bc.ngTemplateMultipleFull || '/ng-modules/basic-crud/bc-multiple/bc-multiple'
}, typeof bc != 'undefined' && bc.ngDirectiveOptions || []));
