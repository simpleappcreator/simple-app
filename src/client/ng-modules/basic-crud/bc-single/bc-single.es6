new ngDirective('bcSingle', function bcSingle($scope, element, attrs) {
    $scope.bc = bc;
    var data = $scope.data = $scope.data || window.data || {};
    // if (!data._id) data = $scope.data = {};
    var schema = bc.schema || {};
    var options = bc.options || {};
    // if (schema.users) $scope.users = schema.users;
    // else console.debug('no users');

    var refs = $scope.refs = $scope.refs || bc.refs || window.refs || {};

    var big = $scope.big = _.size(schema) > 3;

    // console.debug(bc);
    bc.getName = function getName(doc, key) {
        doc = doc || data;
        // key = key || Object.keys(doc)[0];
        // if (key == '_id' && Object.keys(doc)[1])
        //     key = Object.keys(doc)[1];
        // console.debug('doc:', doc);
        return (doc.name || doc.username || doc.title ||
            doc[bc.name] || doc[bc.slug] ||
            doc[bc.collectionName] ||
            doc[key] ||
            // doc[Object.keys(doc)[1]] ||
            // doc._id
            // ''
            _.startCase(bc.Name)
        );
    };
    $scope.getSlug = function getSlug() {
        return _.kebabCase(bc.getName());
    };
    $scope.getUrl = function getUrl() {
        var url = '/' + (bc.admin ? 'admin/' : '') + bc.slug + '/';
        if (data._id) {
            var slug = $scope.getSlug();
            url += slug + '/' + data._id;
        } else
            url += 'add';
        return url;
    };

    $scope[bc.name] = $scope.data;

    $scope.expandToggle = function expandToggle() {
        if (typeof $scope.startFrom == 'undefined') {
            $scope.expanded = true
            return; // can't collapse
        };
        $scope.expanded = !$scope.expanded;
        element.removeClass('expanded');
        element.removeClass('collapsed');
        element.addClass($scope.expanded ? 'expanded' : 'collapsed');
        editingFlag = $scope.expanded;
    };
    if (typeof $scope.startFrom == 'undefined') $scope.expandToggle();

    $scope.getClass = function getClass() {
        var classArr = [];
        if ($scope.add)
            classArr.push('add');
        if ($scope.expanded)
            classArr.push('expanded');
        else
            classArr.push('collapsed');
        return classArr.join(' ');
    };


    for (key in data) {
        if (!schema[key]) continue;
        if (schema[key].type == 'Date') {
            data[key] = new Date(data[key]);
            schema[key].date = true;
        }
        if (schema[key].type == 'ObjectId') {
            schema[key].ObjectId = true;
        }
        if (schema[key].options && typeof schema[key].options == 'string') {
            var option = schema[key].options;
            schema[key].options = options[schema[key].options];
            // console.debug('schema[%s].%s:', key, option, schema[key].options);
        }
        if (schema[key].default) {
            // console.debug('schema[%s].default:', key, schema[key].default);
            // var option = schema[key].options;
            // schema[key].options = options[schema[key].options];
            // console.debug('schema[%s].%s:', key, option, schema[key].options);
        }

    }

    if (!data._id) $scope.add = function add($event) {
        $scope.Working('Adding ' + bc.Name + '...');
        $scope.$http.post('/' + (bc.admin ? 'admin/' : '') + bc.slug + '/add', data).then(function(res) {
            if (!res.data || !res.data._id) throw new Error('Error. Something went wrong (Seems to have added but did not return)');
            res.data = textToDate(res.data);
            _.merge(data, res.data);
            $scope.Success(res.status + ' ' + res.statusText + ': Added ' + bc.Name);
            console.debug(data);

            if (bc.data && bc.data instanceof Array) {
                bc.data.unshift(data);
                data = $scope.data = {};
            } else return window.location = $scope.getUrl();
            $scope.$compile(element)($scope);
            // data = $scope.data = {};
            $scope.expanded = false;
        }).catch($scope.Error.bind($scope));
    };

    $scope.update = function update($event) {
        if (!data._id) return;
        $scope.Working('Updating ' + bc.Name + '...');
        // console.debug('Sending', data);
        $scope.$http.post('/' + (bc.admin ? 'admin/' : '') + bc.slug + '/update', data).then(function(res) {
            if (!res.data || !res.data._id) throw new Error('Error. Something went wrong (Seems to have updated but did not return)');
            res.data = textToDate(res.data);
            _.merge(data, res.data);
            $scope.Success(res.status + ' ' + res.statusText + ': Updated ' + bc.Name);
            console.debug(data);
        }).catch($scope.Error.bind($scope));
    };

    $scope.remove = function remove($event) {
        if (!confirm('Really Delete?')) return;
        $scope.Working('Removing ' + bc.Name + '...');
        $scope.$http.post('/' + (bc.admin ? 'admin/' : '') + bc.slug + '/remove', data).then(function(res) {
            $scope.Success(res.status + ' ' + res.statusText + ': Removed ' + bc.Name);
            switch (true) {
                case $scope.data instanceof Array:
                    return _.remove($scope.data, data);
                case $scope.$parent.data instanceof Array:
                    return _.remove($scope.$parent.data, data);
                case $scope.$parent.$parent.data instanceof Array:
                    return _.remove($scope.$parent.$parent.data, data);
                default:
                    return window.location = '/' + (bc.admin ? 'admin/' : '') + bc.slug + 's';
            }
            // if ($scope.$parent.data && $scope.$parent.data instanceof Array)
            //     _.remove($scope.$parent.data, data);
            // else
            //     window.location = '/' + (bc.admin ? 'admin/' : '') + bc.slug + 's';
        }).catch($scope.Error.bind($scope));
    };

    if (!big && !bc.manualUpdate)
        $scope.watch(1000, 'data', $scope.update.bind($scope));

    element.addClass($scope.getClass());

}, _.extend({
    templateUrl: bc.ngTemplateSingleFull || '/ng-modules/basic-crud/bc-single/bc-single'
}, typeof bc != 'undefined' && bc.ngDirectiveOptions || []));
