var should = require('should');

var User   = require('../models/user');

describe("User", function () {
    describe("defaults", function () {
        var user = {};

        before(function () {
            user = new User({email: 'jdoe@me.com'});
        });

        it('email is jdoe@me.com', function () {
            user.email.should.equal('jdoe@me.com')
        });
        it('has an authentication token', function () {
            user.authenticationToken.should.not.equal(null);
        });
        it('has a pending status', function () {
            user.status.should.equal('pending');
        });
        it('has a created date', function () {
            user.createdAt.should.not.equal(null);
        });
        it('has a signInCount of 0;', function () {
            user.signInCount.should.equal(0);
        });
        it('has lastLogin', function () {
            user.lastLoginAt.should.not.equal(null);
        });
        it('has currentLogin', function () {
            user.currentLoginAt.should.not.equal(null);
        });
    })
});