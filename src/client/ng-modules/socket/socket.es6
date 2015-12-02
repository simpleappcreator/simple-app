const io = require('socket.io-client');
const socket = io.connect();

socket.on('test', ::console.log);
socket.on('connect', () => console.log('Socket connected'));
socket.on('disconnect', () => console.log('Socket disconnected'));
socket.on('reconnect', n => console.log('Socket reconnectted after', n, 'tries.'));
socket.on('reconnect_failed', function() {
    console.error('socket disconnected and could not reconnect');
    alert('Socket disconnected and could not reconnect');
});

socket.on('getUser', user => {
    window.user = user;
});

angular.module('socket', [])
    .factory('$socket', $rootScope => ({
        emit: ::socket.emit,
        on: (msg, callback) =>
            socket.on(msg, (err, data) =>
                $rootScope.$apply(callback.apply(socket, arguments))),
        socket: socket,
    }));
