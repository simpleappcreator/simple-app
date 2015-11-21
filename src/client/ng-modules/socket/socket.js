var socket = io.connect();
socket.on('test', function (test) {
    console.log(test);});

socket.on('connect', function () {
    console.log('Socket connected');});

socket.on('disconnect', function () {
    console.log('Socket disconnected');});

socket.on('reconnect', function (n) {
    console.log('Socket reconnectted after', n, 'tries.');});

socket.on('reconnect_failed', function () {
    console.error('socket disconnected and could not reconnect');
    alert('Socket disconnected and could not reconnect');});


socket.on('getUser', function (user) {
    window.user = user;});


angular.module('socket', []).
factory('$socket', socketFactory);

function socketFactory($rootScope) {
    return { 
        emit: socket.emit.bind(socket), 
        on: function on(msg, callback) {
            // socket.on(msg, $rootScope.$apply.bind($rootScope, callback.bind.apply(socket, arguments)));
            socket.on(msg, function (err, data) {
                // if (err) $rootScope.Error(err + '. ' + callback.name);
                $rootScope.$apply(callback.apply(socket, arguments));});}, 


        socket: socket };}

;
//# sourceMappingURL=socket.js.map
