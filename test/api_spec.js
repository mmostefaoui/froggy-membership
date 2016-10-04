var Membership = require('../index');
var mongoose   = require('mongoose');
var assert     = require('assert');
var config     = require('../lib/config');
var should     = require('should');

describe('Membership', function () {
    before(function (done) {
        if (mongoose.connection.db) return done();
        mongoose.connect(config.mongoURI.test, done);
    });

    var regResult = {};
    describe('authentication', function () {
        var membership = new Membership(config.mongoURI.test);
        before(function (done) {
            membership.register('test@test.com', 'password', 'password', function (err, result) {
                regResult = result;
                assert.ok(result.success, "can't register");
                done();
            });
        });

        it('authenticates', function (done) {
            membership.authenticate('test@test.com', 'password', function (err, result) {
                result.success.should.equal(true);
                done();
            })
        });

        it('gets by token', function (done) {

            membership.findUserByToken(regResult.user.authenticationToken, function (err, user) {
                user.email.should.equal('test@test.com');
                done();
            });
        });

    })
});