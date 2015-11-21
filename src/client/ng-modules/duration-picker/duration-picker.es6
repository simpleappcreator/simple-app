new ngDirective('durationPicker', function durationPicker($scope, element, attrs) {
    $scope.name = attrs.name ? attrs.name : 'value';
    $scope.placeholder = attrs.placeholder ? attrs.placeholder : '';
    $scope.selected = attrs.selected ? attrs.selected : '';
    Object.defineProperty($scope, 'disabled', {
        get: function() { // because attrs.disabled comes and goes
            return attrs.disabled;
        },
    });

    var match;

    $scope.max = attrs.max ? attrs.max : '1year';
    if (match = $scope.max.match(/([0-9]+)([\w]+)s?/)) {
        $scope.max = parseInt(match[1], 10);
        switch (match[2]) {
            case 'minute':
                $scope.max *= 60;
                break;
            case 'hour':
                $scope.max *= 60 * 60;
                break;
            case 'day':
                $scope.max *= 60 * 60 * 24;
                break;
            case 'week':
            case 'month':
            case 'year':
                $scope.max *= 7 * 60 * 60 * 24;
                break;
        }
    }
    if ($scope.max == 'forever')
        $scope.max = 7 * 60 * 60 * 24;

    $scope.input = {};
    $scope.output = $scope.output || {};


    $scope.s = '';
    $scope.watch(100, 'input', input_changed);
    $scope.watch(100, 'output', output_changed);


    function input_changed() {
        if ($scope.input.value > 1) $scope.s = 's';
        else $scope.s = '';
        $scope.forever = $scope.$parent.forever = false;
        switch ($scope.input.unit) {
            case 'seconds':
                if ($scope.input.value <= 0) {
                    $scope.input.value = 1;
                } else if ($scope.input.value >= 60) {
                    $scope.input.value = 1;
                    $scope.input.unit = 'minutes';
                }
                break;
            case 'minutes':
                if ($scope.input.value <= 0) {
                    $scope.input.value = 59;
                    $scope.input.unit = 'seconds';
                } else if ($scope.input.value >= 60) {
                    $scope.input.value = 1;
                    $scope.input.unit = 'hours';
                }
                break;
            case 'hours':
                if ($scope.input.value <= 0) {
                    $scope.input.value = 59;
                    $scope.input.unit = 'minutes';
                } else if ($scope.input.value >= 24) {
                    $scope.input.value = 1;
                    $scope.input.unit = 'days';
                }
                break;
            case 'days':
                if ($scope.input.value <= 0) {
                    $scope.input.value = 23;
                    $scope.input.unit = 'hours';
                } else if ($scope.input.value >= 8) {
                    $scope.input.value = 1;
                    $scope.input.unit = 'forever';
                    $scope.forever = $scope.$parent.forever = true;
                }
                break;
            case 'forever':
                $scope.forever = $scope.$parent.forever = true;
                if ($scope.input.value <= 0) {
                    $scope.input.value = 7;
                    $scope.input.unit = 'days';
                    $scope.forever = $scope.$parent.forever = false;
                } else if ($scope.input.value >= 1) {
                    $scope.input.value = 1;
                }
                break;
        }

        $scope.output[$scope.name] = $scope.input.value;
        switch ($scope.input.unit) {
            case 'minutes':
                $scope.output[$scope.name] *= 60;
                break;
            case 'hours':
                $scope.output[$scope.name] *= 3600;
                break;
            case 'days':
                $scope.output[$scope.name] *= 86400;
                break;
            case 'forever':
                $scope.output[$scope.name] *= 604800;
                break;
        }
        if ($scope.output[$scope.name] > $scope.max) {
            $scope.output[$scope.name] = $scope.max;
        }
    }

    function output_changed() {
        $scope.forever = $scope.$parent.forever = false;
        $scope.s = '';
        switch (true) {
            case ($scope.output[$scope.name] >= 604800):
                $scope.input.value = 1;
                $scope.input.unit = 'forever';
                $scope.forever = $scope.$parent.forever = true;
                break;
            case ($scope.output[$scope.name] >= 86400):
                $scope.input.value = $scope.output[$scope.name] / (86400);
                $scope.input.unit = 'days';
                break;
            case ($scope.output[$scope.name] >= 3600):
                $scope.input.value = $scope.output[$scope.name] / (3600);
                $scope.input.unit = 'hours';
                break;
            case ($scope.output[$scope.name] >= 60):
                $scope.input.value = $scope.output[$scope.name] / (60);
                $scope.input.unit = 'minutes';
                break;
            case ($scope.output[$scope.name] < 60):
                $scope.input.value = $scope.output[$scope.name];
                $scope.input.unit = 'seconds';
                break;
        }
        if ($scope.input.value > 1) $scope.s = 's';
    }


    if (typeof $scope.output[$scope.name] != 'undefined') output_changed();
    else if (typeof attrs.default != 'undefined' && attrs.default.length) {
        if (attrs.default == 'forever')
            output_changed($scope.output[$scope.name] = $scope.max);
        else if (match = attrs.default.match(/([0-9]+)([\w]*)s?/)) {
            $scope.input = {
                value: parseInt(match[1], 10),
                unit: (match[2] && match[2].length) ? match[2] + 's' : 'seconds',
            };
            input_changed();
        }
    }


});
