var assert = require('assert');
var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var logSchema = mongoose.Schema({
    subject: String,
    entry: String,
    createdAt: {type: Date, default: Date.now},
    userId: {type: ObjectId, ref: 'User'},
});

module.exports = mongoose.model("Log", logSchema);
