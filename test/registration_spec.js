var Registration = require('../lib/registration');
var mongoose = require('mongoose');
var config = require('../lib/config');
var clearDB  = require('mocha-mongoose')(config.mongoURI.test);

describe('Registration', function () {

    // happy path
    describe('a valid application', function () {
        var regResult = {};
        var reg = null;

        before(function(done) {
            if (mongoose.connection.db) return done();

            mongoose.connect(config.mongoURI.test, done);
        });

        before(function(done) {
            clearDB(done);
        });

        before(function (done) {
            reg = new Registration(config.mongoURI.test);
            reg.applyForMembership(
                {
                    email: 'jdoe@test5.com',
                    password: 'password',
                    confirm: 'password'
                }, function(err,result){
                    regResult = result;
                    done();
                });
        });
        it('is successful', function () {
            regResult.success.should.equal(true);
        });
        it('creates a user', function () {
            //console.slog(regResult.user);
            regResult.log.should.not.be.undefined();
        });
        it('creates a log entry', function () {
            regResult.log.should.not.be.undefined();
        });
        it("sets the user's status to approved", function () {
            regResult.user.status.should.equal('approved');
        });
        it('offers a welcome message', function () {
            regResult.message.should.equal('Welcome!');
        });
        it('increments the signInCount', function () {
            regResult.user.signInCount.should.equal(1);
        })
    });

    describe('an empty or null email', function () {
        it('is not successful');
        it('tells user that email is required');
    });

    describe('an empty or null password', function () {
        it('is not successful');
        it('tells user that password is required');
    });

    describe('a password and confirm mismatch', function () {
        it('is not successful');
        it("tells user that passwords don't match");
    });

    describe('email already exists', function () {
        it('is not successful');
        it('tells user that email already exists');
    });
});