var app = angular.module('app', [
    'ngSanitize', 'ngAnimate', 'ngTouch', 'ngStorage',
    'ui.utils',
    // 'ngTemplates',
    // 'alertErr', 'durationPicker', 'startFrom', 'fromNow',
].concat(ngModules));
//config(function($locationProvider){$locationProvider.html5Mode(true).hashPrefix('!')}).
app.controller('root', function(
    $scope, $rootScope,
    $window,
    $timeout, $interval,
    $q,
    $location, $http,
    $localStorage, $sessionStorage,
    $socket,
    $compile
) {
    console.log('App loaded');

    window.$scope = $rootScope;
    $rootScope.$ = $;
    try{ $rootScope.user = user }catch(err){ $rootScope.user = window.user }
    try{ $rootScope.err  = err  }catch(err){ $rootScope.err  = window.err  }
    try{ $rootScope.bc   = bc   }catch(err){ $rootScope.bc   = window.bc   }
    try{ $rootScope.data = data }catch(err){ $rootScope.data = window.data }
    try{ $rootScope.meta = meta }catch(err){ $rootScope.meta = window.meta }
    try{ $rootScope.refs = refs }catch(err){ $rootScope.refs = window.refs }
    try{ $rootScope.user = user }catch(err){ $rootScope.user = window.user }

    $rootScope.$window = $rootScope.window = $window;
    $rootScope.addEventListener = $window.addEventListener.bind($window);
    $rootScope.$timeout = $rootScope.timeout = $timeout;
    $rootScope.$interval = $rootScope.interval = $interval;
    $rootScope.$q = $rootScope.q = $q;
    $rootScope.$location = $rootScope.location = $location;
    $rootScope.$http = $rootScope.http = $http;
    // $http.defaults.cache = true;

    $rootScope.$localStorage = $rootScope.$storage = $rootScope.storage = $rootScope.localStorage = $localStorage;
    $rootScope.$sessionStorage = $rootScope.sessionStorage = $sessionStorage;
    $rootScope.$socket = $rootScope.socket = $socket;
    $rootScope.$compile = $rootScope.compile = $compile;

    $rootScope.Date = Date;
    $rootScope.JSON = JSON;
    $rootScope.encodeURIComponent = encodeURIComponent;
    $rootScope.confirm = confirm;
    $rootScope.moment = moment;
    $rootScope.slug = slug;
    $rootScope._ = _;
    $rootScope.copy = function(input) {
        return JSON.parse(JSON.stringify(input))
    };

    $rootScope.textToDate = textToDate;
    $rootScope.$timeout = function(promise, callback, duration) {
        $timeout.cancel(promise);
        promise = $timeout(callback, duration);
    };

    $rootScope.$watchNew = $rootScope.$watchnew = $rootScope.$watchn = $rootScope.watch = function ScopeWatchOnlyForNewChanges(prop, cb, cb2) {
        var self = this;
        if (typeof prop == 'number') {
            var delay = prop;
            prop = cb;
            cb = cb2;
        }
        if (!delay) delay = 0;
        var delayTimeout;

        $rootScope.$watch.call(self, prop, function(n, o) {
            if (n === o) return;
            $timeout.cancel(delayTimeout);
            var args = arguments;
            delayTimeout = $timeout(function() {
                cb.apply(self, args);
            }, delay);
        }, true);
    };

    $rootScope.Error = function ShowErrorMessage(err) {
        this.clear();
        if (err) {
            if (typeof err == 'string')
                this.err = this.error = err;
            else if (err.message)
                this.err = this.error = err.message;
            else if (err.status)
                this.err = this.error = err.status + ' ' + err.statusText + ': ' + err.data.substr(0, 100);
        } else
            this.err = this.error = 'Error! Something went wrong';
        console.error(this.err);
    };
    $rootScope.Success = function ShowSuccessMessage(success) {
        this.clear();
        this.success = success || 'Success!';
        console.log(this.success);
    };

    $rootScope.Working = function ShowWorkingMessage(working, timeout) {
        this.clear();
        working = working.replace(/[\.]*$/g, '');
        this.working = (working || 'Working');
        console.log(this.working);
        this.working += workingElipses();
        this.intervalPromise = $interval(function() {
            if (this.hasOwnProperty('working') && this.working) {
                this.working = this.working.replace(/[\.]*$/g, '');
                this.working = this.working + workingElipses();
            }
        }.bind(this), 333);
        this.timeoutPromise = $timeout(function() {
            if (this.hasOwnProperty('working') && this.working) {
                if (timeout instanceof Function)
                    return timeout().bind(this);
                this.Error(typeof(timeout) == 'string' ? timeout : 'Request timed out');
            }
        }.bind(this), (((typeof(timeout) == 'number') ? timeout : 30) * 1000));
    };

    function workingElipses() {
        if (!workingElipses.workingElipses)
            workingElipses.workingElipses = '';
        if (workingElipses.workingElipses.slice(-3) == '...')
            workingElipses.workingElipses = '';
        workingElipses.workingElipses = workingElipses.workingElipses + '.';
        return workingElipses.workingElipses;
    }
    $rootScope.Progress = function ShowProgressMessage(message, counter, timeout) {
        this.clear();
        this.Working((message + ' ' + counter), timeout);
    };
    $rootScope.Clear = $rootScope.clear = function ClearErrorMessages() {
        this.err = this.error = null;
        this.working = null;
        this.success = null;
        if (this.hasOwnProperty('intervalPromise'))
            $interval.cancel(this.intervalPromise);
        if (this.hasOwnProperty('timeoutPromise'))
            $timeout.cancel(this.timeoutPromise);
    };

    // ready();
});
app.controller(path, function($scope) {});

try {
    ion.sound({
        sounds: [{
            name: 'door_bell',
        }],
        volume: 1,
        path: '/public/vendor/sounds/',
        preload: true
    });
} catch (err) {}

$(document).keyup(function(event) {
    if (event.target.tagName == 'SELECT')
        $(event.target).change();
});


function textToDate(object) {
    if (typeof object == 'string')
        return isDateToDate(object);
    for (key in object)
        object[key] = isDateToDate(object[key]);
    return object;

    function isDateToDate(value) {
        if (!isDate(value)) return value;
        return new Date(value);
    }

    function isDate(str) {
        if (typeof str != 'string') return false;
        return !!str.match(/[0-9]{4}\-[0-9]{2}\-[0-9]{2}T[0-9]{2}\:[0-9]{2}\:[0-9]{2}\.[0-9]{3}Z$/);
    }
};
