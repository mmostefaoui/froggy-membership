var Application = function (args) {

    var _that = this;

    _that.email    = args.email;
    _that.password = args.password;
    _that.confirm  = args.confirm;
    _that.status   = 'pending';
    _that.message  = null;
    _that.user     = null;
    _that.log      = null;

    _that.isValid = function () {
        return _that.status == 'validated';
    };

    _that.isInvalid = function () {
        return !_that.isValid();
    };

    _that.setInvalid = function (message) {
        _that.status  = 'invalid';
        _that.message = message;
    };

    _that.validate = function (message) {
        _that.status = 'validated';
    };

    return _that;

};

module.exports = Application;