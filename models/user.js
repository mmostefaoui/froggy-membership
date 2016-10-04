var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var randomstring = require("randomstring");
var bcrypt       = require('bcrypt-nodejs');

var userSchema = new Schema({
    email: {type: String, required: true},
    password: {type: String, required: true},
    createdAt: {type: Date, default: Date.now()},
    status: {type: String, default: 'pending'},
    signInCount: {type: Number, default: 0},
    lastLoginAt: {type: Date, default: Date.now()},
    currentLoginAt: {type: Date, default: Date.now()},
    currentSessionToken: {type: String, default: null},
    reminderToken: {type: String, default: null},
    reminderSentAt: {type: String, default: null},
    authenticationToken: {type: String, default: randomstring.generate(18)}
});

userSchema.methods.generateAuthToken = function (length) {
    return randomstring.generate(length);
};

userSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};


userSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
