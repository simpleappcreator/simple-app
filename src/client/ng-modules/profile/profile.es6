new ngDirective('profile', function profile($scope, element, attrs) {
    $scope.ignoredKeys = ['id', '_id', 'updated', 'login', 'created', 'admin', 'author', 'enabled', 'verified', 'user', 'username', 'name', 'email', 'provider'];

    var user = $scope.user;

    $scope.submit = function() {
        $scope.Working('Saving user');
        console.log(user);
        $scope.$http.post('/profile', user)
            .then(function(res){
                if (!res.data || !res.data._id) throw new Error('Error. Something went wrong (Seems to have updated but did not return)');
                res.data = textToDate(res.data);
                _.merge(user, res.data);
                $scope.Success(res.status + ' ' + res.statusText + ': Updated user!');
                console.debug(user);
            })
            .catch($scope.Error.bind($scope));
    }
});
