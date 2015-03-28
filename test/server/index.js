var console = require('unclog');
var app = require('simple-app');


app.get('/get', function(req, res) {
    res.send('/get');
});

app.get('/', function(req, res, next) {
    // res.send('/no');
    next();
});

app.io.on('connection', function(socket) {
    socket.emit('test', 1);
});
app.io.socket.on('test', function(data) {
    if (data > 10) return;
    console.debug(data);
    this.emit('test', data + 1);
});
