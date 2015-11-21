new ngDirective('comments', function comments($scope, element, attrs) {
    var comments = $scope.comments;
    $scope.removeComment = function (comment) {
        _.remove(comments, comment);
        $scope.update();};

    $scope.addComment = function (text) {
        comments.push({ 
            text: text, 
            author: user._id });

        $scope.update();};});
//# sourceMappingURL=comments.js.map
