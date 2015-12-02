require('./auto-save.styl');

new ngDirective('autoSave', $scope => {
    $scope.save = function save($event) {
        $scope.$emit('save', $event);
    }
    $scope.revert = function revert($event) {
        $scope.$emit('revert', $event);
    }
});
