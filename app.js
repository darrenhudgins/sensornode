"use strict";

var express      = require('express');
var path         = require('path');
var logger       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var routes       = require('./routes/');
var nib          = require("nib");
var stylus       = require("stylus");
var pkg          = require("./package.json");
var app          = express();

app.set("title", pkg.description);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());

// Setup stylus compilation
app.use(require('stylus').middleware({
    src: path.join(__dirname, "public"),
    compile: function (str, path) {
        return stylus(str).set("filename", path).set("compress", true).use(nib());
    }
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/', routes(app));

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;

