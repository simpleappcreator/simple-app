new ngDirective('login', function login($scope, element, attrs) {
    if ($scope.err) $scope.Error($scope.err);
    $scope.submit = function submit($event) {
        if ($scope.form.newuser && $scope.form.password.length < 5 && !confirm('Your password is very insecure. \nAre you sure?')) $event.preventDefault();};

    $scope.watch('form', function () {
        if ($scope.form.remembertime >= 60 && $scope.form.remembertimeunit == 'minutes') {
            $scope.form.remembertime = 1;
            $scope.form.remembertimeunit = 'hours';}

        if ($scope.form.remembertime >= 24 && $scope.form.remembertimeunit == 'hours') {
            $scope.form.remembertime = 1;
            $scope.form.remembertimeunit = 'days';}

        if ($scope.form.remembertime <= 0 && $scope.form.remembertimeunit == 'days') {
            $scope.form.remembertime = 23;
            $scope.form.remembertimeunit = 'hours';}

        if ($scope.form.remembertime <= 0 && $scope.form.remembertimeunit == 'hours') {
            $scope.form.remembertime = 59;
            $scope.form.remembertimeunit = 'minutes';}

        if ($scope.form.remembertime <= 0 && $scope.form.remembertimeunit == 'minutes') {
            $scope.form.remembertime = 1;
            $scope.form.rememberme = false;
            $('#rememberme').focus();
            $scope.rememberme = 0;}

        $scope.rememberme = $scope.form.remembertime;
        if ($scope.form.remembertimeunit == 'minutes') 
        $scope.rememberme *= 60;
        if ($scope.form.remembertimeunit == 'hours') 
        $scope.rememberme *= 60 * 60;
        if ($scope.form.remembertimeunit == 'days') 
        $scope.rememberme *= 60 * 60 * 24;
        if ($scope.form.remembertimeunit == 'forever') 
        $scope.rememberme = -1;
        if (!$scope.form.rememberme) 
        $scope.rememberme = 0;


        // $scope.timeout.cancel(checkTimeout);
        // $scope.Clear();
        // checkTimeout = $scope.timeout(function() {
        //     $scope.Working('Checking');
        //     $scope.$socket.emit('login', $scope.form);
        // }, 1000);
    });
    $scope.$socket.on('login', function (err, user) {
        if (err) return $scope.Error(err);
        if (user === false) {
            $scope.form.context = 'Register';}});});
//# sourceMappingURL=login.js.map
