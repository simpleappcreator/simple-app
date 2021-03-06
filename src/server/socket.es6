var io = app.io = module.exports =
    require('socket.io')
    .listen(app.server);

var passport = io.passport = require('passport.socketio');

// Logging


// Auth
io.use(passport.authorize({
    cookieParser: app.cookieParser,
    secret: app.secretSauce,
    store: app.sessionStore,
    fail: function onAuthorizeFail(data, message, error, accept) {
        accept(null, false);
    },
}));

// Log requests
io.use(require('./log-socket'));

io.on('connection', function(socket) {
    var user = socket.request.user;
    socket.join(user.id);
});



// App.socket = io.socket = {};
// io.socket.on = function() {
//     var args = arguments;
//     io.on('connection', function(socket) {
//         args[1] = args[1].bind(socket);
//         socket.on.apply(socket, args);
//     });
// };
