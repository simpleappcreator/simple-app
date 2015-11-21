new ngDirective('autoSave', function autoSave($scope, element, attrs) {
    $scope.save = function save($event) {
        $scope.$emit('save', $event);};

    $scope.revert = function revert($event) {
        $scope.$emit('revert', $event);};});
//# sourceMappingURL=auto-save.js.map
