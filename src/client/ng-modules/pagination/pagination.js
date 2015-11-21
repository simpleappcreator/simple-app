new ngDirective('pagination', function pagination($scope, element, attrs) {

    if ($scope.dataName) {
        var singular = $scope.dataName.toLowerCase();
        var limited = 'limited' + _.capitalize(singular) + 's';
        var filtered = 'filtered' + _.capitalize(singular) + 's';} else 
    if ($scope.data && $scope.data.length) {
        var singular = 'data';
        var limited = 'limitedData';
        var filtered = 'filteredData';} else 
    return console.error('Pagination needs $scope.data or $scope.dataName');

    $scope.text = function paginationText() {
        var text = '';
        var start = $scope.startFrom;
        var width = $scope.limitTo;
        var lenth = $scope[limited].length;
        var total = $scope[filtered].length;
        var a = start;
        var c = total;
        var b = width;
        if (start >= width) 
        b = start + width;
        if (start + width >= total) 
        b = total;
        var x = a + ' to ';
        if (a == 0) x = '';
        return 'Showing ' + x + b + ' of ' + c;};


    $scope.shouldPrev = function paginationShouldShowPrev() {
        return $scope.startFrom > 0;};

    $scope.shouldNext = function paginationShouldShowNext() {
        return $scope.startFrom + $scope.limitTo < $scope[filtered].length;};

    $scope.goPrev = function paginationGoPrev() {
        if (!$scope.shouldPrev()) return;
        $scope.$parent.startFrom -= $scope.limitTo;};

    $scope.goNext = function paginationGoNext() {
        if (!$scope.shouldNext()) return;
        $scope.$parent.startFrom += $scope.limitTo;};});
//# sourceMappingURL=pagination.js.map
