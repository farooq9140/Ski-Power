'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    password: { type: String, required: true },
    bio: { type: String },
    email: { type: String },
    birthday: { type: Date },
    profilepicture: { type: Schema.Types.ObjectId, ref: 'Picture' },
    creationdate: { type: Date, default: Date.now },
    modifieddate: { type: Date, default: Date.now },
}, {
    toJSON: {
        virtuals: true
    }
});

schema.virtual('displayname').get(function() {
    return this.firstname + ' ' + this.lastname;
});

module.exports = mongoose.model('User', schema);
