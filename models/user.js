var assert       = require('assert');
var randomstring = require("randomstring");

var User = function (args) {
    assert.ok(args.email, 'Email is required');
    var user = {};

    user.email               = args.email;
    user.createdAt           = args.createdAt || new Date();
    user.status              = args.status || 'pending';
    user.signInCount         = args.signInCount || 0;
    user.lastLoginAt         = args.lastLoginAt || new Date();
    user.currentLoginAt      = args.currentLoginAt || new Date();
    user.currentSessionToken = args.currentSessionToken || null;
    user.reminderToken       = args.reminderToken || null;
    user.reminderSentAt      = args.reminderSentAt || null;
    user.authenticationToken = args.authenticationToken || randomstring.generate({length: 18});

    return user;
};

module.exports = User;