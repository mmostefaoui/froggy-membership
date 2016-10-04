var User        = require('../models/user');
var Log         = require('../models/log');
var Application = require('../models/application');
var assert      = require('assert');
var mongoose    = require('mongoose');
var config      = require('../lib/config');
var Emitter     = require('events').EventEmitter;
var util        = require('util'); // node library

var RegResult = function () {
    return {
        success: false,
        message: null,
        user: null,
        log: null
    };
};

var Registration = function () {

    Emitter.call(this);
    var _that        = this;
    var continueWith = null;

    if (!mongoose.connection.db)
        mongoose.connect(config.mongoURI.test);

    var addLogEntry = function (app) {
        var log     = new Log();
        log.subject = 'Registration';
        log.entry   = 'Successfully registered';
        log.userId  = app.user._id;

        log.save(log, function (err, newLog) {
            assert.ok(err === null, err);
            app.log = newLog;
            _that.emit('log-created', app);
        });
    };

    var checkIfUserExists = function (app) {
        User.findOne({email: app.email}, function (err, user) {
            assert.ok(err === null, err);
            if (user) {
                app.setInvalid("Email already exists");
                _that.emit('invalid', app);
            }
            else {
                _that.emit('user-doesnt-exist', app);
            }
        });
    };

    var createUser = function (app) {
        var user         = new User();
        user.email       = app.email;
        user.password    = user.generateHash(app.password);
        user.status      = 'approved';
        user.signInCount = 1;

        user.save(user, function (err, newUser) {
            assert.ok(err === null, err);
            app.user = newUser;
            _that.emit('user-created', app);
        });
    };

    var validateInputs = function (app) {
        if (!app.email || !app.password) {
            app.setInvalid('Email and password are required');
            _that.emit('invalid', app);
        }
        else if (app.password !== app.confirm) {
            app.setInvalid("Passwords don't match");
            _that.emit('invalid', app);
        }
        else {
            app.validate();
            _that.emit('validated', app);
        }
    };

    _that.applyForMembership = function (args, next) {
        continueWith = next;
        var app      = new Application(args);
        _that.emit('application-received', app);
    };

    var registrationOk = function (app) {
        var regResult     = new RegResult();
        regResult.success = true;
        regResult.message = "Welcome!";
        regResult.user    = app.user;
        regResult.log     = app.log;
        _that.emit("registered", regResult);
        if (continueWith) {
            continueWith(null, regResult);
        }
    };

    var registrationNotOk = function (app) {
        var regResult     = new RegResult();
        regResult.success = false;
        regResult.message = app.message;
        _that.emit("not-registered", regResult);
        if (continueWith) {
            continueWith(null, regResult);
        }
    };

    //The event chain for a successful registration
    _that.on("application-received",validateInputs);
    _that.on("validated", checkIfUserExists);
    _that.on("user-doesnt-exist",createUser);
    _that.on("user-created",addLogEntry);
    _that.on("log-created",registrationOk);

    //the event chain for a non-successful registration
    _that.on("invalid",registrationNotOk);

    return _that;
};

util.inherits(Registration, Emitter);

module.exports = Registration;