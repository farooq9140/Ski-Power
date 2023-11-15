'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LoadCellDataSchema = new Schema({
  weight: { type: Number },
  timestamp: { type: Number }
});

var schema = new Schema({
  loadcelldata: { type: [LoadCellDataSchema]},
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  activity: { type: Schema.Types.ObjectId, ref: 'Activity' },
  creationdate: { type: Date, default: Date.now },
  modifieddate: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Loadcell', schema);
