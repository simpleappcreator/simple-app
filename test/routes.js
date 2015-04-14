var app = require('simple-app');

app.get('/routes', function MainHandler(req, res, next) {
    res.send('Hi!');
});

