var events   = require("events").EventEmitter;
var util     = require("util");
var mongoose = require('mongoose');
var assert   = require('assert');
var User     = require('../models/user');
var Log      = require('../models/log');

var AuthResult = function (creds) {
    return {
        creds: creds,
        success: false,
        message: 'Invalid email or password',
        user: null,
        log: null
    };
};

var Authentication = function (mongoURI) {
    var _that        = this;
    var continueWith = null;
    events.EventEmitter.call(_that);

    if (!mongoose.connection.db)
        mongoose.connect(mongoURI);

    //validate the creds
    var validateCredentials = function (authResult) {
        if (authResult.creds.email && authResult.creds.password) {
            _that.emit('creds-ok', authResult);
        }
        else {
            _that.emit('invalid', authResult);
        }
    };

    //find the user
    var findUser = function (authResult) {
        User.findOne({email: authResult.creds.email}, function (err, foundUser) {
            assert.ok(err === null, err);
            if (foundUser) {
                authResult.user = foundUser;
                _that.emit('user-found', authResult);
            }
            else {
                _that.emit('invalid', authResult);
            }
        })
    };

    //compare the password
    var comparePassword = function (authResult) {
        var matched = authResult.user.validPassword(authResult.creds.password);
        if (matched) {
            _that.emit("password-accepted", authResult);
        }
        else {
            _that.emit("invalid", authResult);
        }
    };

    //bump the state
    //update user
    var updateUserStats = function (authResult) {
        authResult.user.signInCount += 1;
        authResult.user.lastLoginAt    = authResult.user.currentLoginAt;
        authResult.user.currentLoginAt = new Date();

        //now save them
        var updates = {
            signInCount: authResult.user.signInCount,
            lastLoginAt: authResult.user.lastLoginAt,
            currentLoginAt: authResult.user.currentLoginAt
        };

        User.update({_id: authResult.user._id}, {$set: updates}, function (err, result) {
            assert.ok(err === null, err);
            _that.emit('stats-updated', authResult);
        })
    };

    //create a log entry
    var createLog = function (authResult) {
        var log     = new Log();
        log.subject = 'Authentication';
        log.entry   = 'Successfully logged in';
        log.userId  = authResult.user._id;

        log.save(log, function (err, newLog) {
            assert.ok(err === null, err);
            authResult.log = newLog;
            _that.emit('log-created', authResult);
        });
    };

    var authOk = function (authResult) {
        authResult.success = true;
        authResult.message = "Welcome!";
        _that.emit("authenticated", authResult);
        _that.emit("completed", authResult);
        if (continueWith) {
            continueWith(null, authResult);
        }
    };

    //if anything fails this will be called
    var authNotOk = function (authResult) {
        authResult.success = false;
        _that.emit("not-authenticated", authResult);
        _that.emit("completed", authResult);
        if (continueWith) {
            continueWith(null, authResult);
        }
    };

    //happy path
    _that.on('login-received', validateCredentials);
    _that.on('creds-ok', findUser);
    _that.on('user-found', comparePassword);
    _that.on('password-accepted', updateUserStats);
    _that.on('stats-updated', createLog);
    _that.on('log-created', authOk);

    //sad path
    _that.on('invalid', authNotOk);

    _that.authenticate = function (creds, next) {
        continueWith   = next;
        var authResult = new AuthResult(creds);
        _that.emit('login-received', authResult);
    }
};

util.inherits(Authentication, events.EventEmitter);
module.exports = Authentication;
