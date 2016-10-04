var Emitter        = require('events').EventEmitter;
var util           = require("util");
var mongoose       = require('mongoose');
var Registration   = require('./lib/registration');
var Authentication = require('./lib/authentication');
var User           = require('./models/user');

var Membership = function (mongoURI) {
    var _that = this;
    Emitter.call(_that);

    _that.findUserByToken = function (token, next) {
        if (!mongoose.connection.db)
            mongoose.connect(mongoURI);
        User.findOne({authenticationToken: token}, next);
    };

    _that.authenticate = function (email, password, next) {
        var auth = new Authentication(mongoURI);

        auth.on("authenticated", function (authResult) {
            _that.emit("authenticated", authResult);
        });
        auth.on("not-authenticated", function (authResult) {
            _that.emit("not-authenticated", authResult);
        });
        auth.authenticate({email: email, password: password}, next);
    };

    _that.register = function (email, password, confirm, next) {
        var reg = new Registration(mongoURI);

        reg.on("registered", function (regResult) {
            _that.emit("registered", regResult);
        });
        reg.on("not-registered", function (regResult) {
            _that.emit("not-registered", regResult);
        });
        reg.applyForMembership({email: email, password: password, confirm: confirm}, next);
    };

    return _that;
};

util.inherits(Membership, Emitter);
module.exports = Membership;
