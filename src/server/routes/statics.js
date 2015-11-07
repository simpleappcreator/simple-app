var express = require('express');

app.get(/\.(js|css|ico|png|jpg|jpeg|woff|mp3|ogg)/, express.static(app.appdir + '/client'));
app.get(/\.(js|css|ico|png|jpg|jpeg|woff|mp3|ogg)/, express.static(app.moddir + '/client'));

// app.get(/\.(js|css|ico|png|jpg|jpeg|woff|mp3|ogg)/, express.static(app.appdir + '/client'));
// app.get(/\.(js|css|ico|png|jpg|jpeg|woff|mp3|ogg)/, express.static(app.appdir + '/client/public/app'));
// app.get(/\.(js|css|ico|png|jpg|jpeg|woff|mp3|ogg)/, express.static(app.appdir + '/client/public/vendor'));
// app.get(/\.(js|css|ico|png|jpg|jpeg|woff|mp3|ogg)/, express.static(app.moddir + '/client'));
// app.get(/\.(js|css|ico|png|jpg|jpeg|woff|mp3|ogg)/, express.static(app.moddir + '/client/public/app'));
// app.get(/\.(js|css|ico|png|jpg|jpeg|woff|mp3|ogg)/, express.static(app.moddir + '/client/public/vendor'));
