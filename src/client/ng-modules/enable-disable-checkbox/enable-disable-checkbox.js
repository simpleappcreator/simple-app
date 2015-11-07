new ngDirective('enableDisableCheckbox', function enableDisableCheckbox($scope, element, attrs) {
    $scope.attrs = attrs;
    $scope.input = {
        enabled: false,
        disabled: false,
    };
    $scope.output[$scope.attrs.name] = undefined;
    $scope.watch('input.enabled', function() {
        if ($scope.input.enabled === true) {
            if ($scope.input.disabled === true)
                $scope.input.disabled = false;
            $scope.output[$scope.attrs.name] = $scope.input.enabled;
        } else {
            if ($scope.input.disabled === false)
                $scope.output[$scope.attrs.name] = undefined;
        }
    });
    $scope.watch('input.disabled', function() {
        if ($scope.input.enabled === true) {
            if ($scope.input.disabled === true) {
                $scope.input.enabled = false;
                $scope.output[$scope.attrs.name] = $scope.input.enabled;
            }
        } else {
            if ($scope.input.disabled === false)
                $scope.output[$scope.attrs.name] = undefined;
            else
                $scope.output[$scope.attrs.name] = $scope.input.enabled;
        }
    });
    // enabled disabled    enabled*    disabled*
    // T       T           d=f;o=e=t   e=f;o=d=t
    // F       F           o=u;        o=u
    // T       F           o=t;        x
    // F       T           x           o=d
});

