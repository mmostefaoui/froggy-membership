var Registration   = require('../lib/registration');
var Authentication = require('../lib/authentication');
var mongoose       = require('mongoose');
var assert         = require('assert');
var config         = require('../lib/config');
var clearDB        = require('mocha-mongoose')(config.mongoURI.test);
var should         = require('should');

describe('Authentication', function () {
    var reg       = {};
    var auth      = {};
    before(function (done) {
        if (mongoose.connection.db) return done();
        mongoose.connect(config.mongoURI.test, done);
    });

    before(function (done) {
        clearDB(done);
    });
    describe('a valid login', function () {
        var authResult = {};
        before(function (done) {
            reg = new Registration(config.mongoURI.test);
            reg.applyForMembership(
                {
                    email: 'test@test.com',
                    password: 'password',
                    confirm: 'password'
                }, function (err, regResult) {
                    assert.ok(regResult.success);

                    //log them in
                    auth = new Authentication(config.mongoURI.test);
                    auth.authenticate({email: 'test@test.com', password: 'password'}, function (err, result) {
                        assert.ok(err === null, err);
                        authResult = result;
                    });
                    done();
                });
        });
        it('is successful', function () {
            authResult.success.should.equal(true);
        });
        it('returns a user', function () {
            should.exist(authResult.user);
        });
        it('creates a log entry', function () {
            should.exist(authResult.log);
        });
        it('update the user stats', function () {
            authResult.user.signInCount.should.equal(2);
        });
        it('updates the signon dates', function () {
            should.exist(authResult.user.lastLoginAt);
            should.exist(authResult.user.currentLoginAt);
        })
    });

    describe('empty email', function () {
        var authResult = {};
        before(function (done) {
            auth = new Authentication(config.mongoURI.test);
            auth.authenticate({email: '', password: 'password'}, function (err, result) {
                assert.ok(err === null, err);
                authResult = result;
            });
            done();
        });

        it('is not successful', function () {
            authResult.success.should.equal(false);
        });
        it('returns a message saying "Invalid login"', function () {
            authResult.message.should.equal('Invalid email or password');
        });
    });

    describe('empty password', function () {
        var authResult = {};
        before(function (done) {
            auth = new Authentication(config.mongoURI.test);
            auth.authenticate({email: 'test@test.com', password: null}, function (err, result) {
                assert.ok(err === null, err);
                authResult = result;
            });
            done();
        });
        it('is not successful', function () {
            authResult.success.should.equal(false);
        });
        it('returns a message saying "Invalid login"', function () {
            authResult.message.should.equal('Invalid email or password');
        });
    });

    describe('passwords does not match', function () {
        var authResult = {};
        before(function (done) {
            auth = new Authentication(config.mongoURI.test);
            auth.authenticate({email: 'xxxxtest@test.com', password: 'wrongpassword'}, function (err, result) {
                assert.ok(err === null, err);
                authResult = result;
            });
            done();
        });
        it('is not successful', function () {
            authResult.success.should.equal(false);
        });
        it('returns a message saying "Invalid login"', function () {
            authResult.message.should.equal('Invalid email or password');
        });
    });

    describe('email not found', function () {

    });
});