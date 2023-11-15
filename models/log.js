// Logs all GET requests to API
'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    method: { type: String, required: true },
    url: { type: String, required: true },
    baseUrl: { type: String, required: true },
    params: { type: Object, required: true },
    query: { type: Object, required: true },
    creationdate: { type: Date, default: Date.now },
    modifieddate: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Log', schema);
