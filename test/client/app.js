var socket = io.connect();
io.on('connection', function(socket) {
    socket.emit('test', 1);
});
socket.on('test', function(data) {
    if (data > 10) return;
    console.debug('socket:test', data, '.');
    socket.emit('test', data + 1);
});
