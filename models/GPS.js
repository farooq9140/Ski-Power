'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var GPSDataSchema = new Schema({
  latitude: { type: Number },
  longitude: { type: Number },
  satellite: { type: Number },
  altitude: { type: Number },
  speed: { type: Number},
  timestamp: { type: Number },
});

var schema = new Schema({
  GPSdata: { type: [GPSDataSchema]},
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  activity: { type: Schema.Types.ObjectId, ref: 'Activity' },
  creationdate: { type: Date, default: Date.now },
  modifieddate: { type: Date, default: Date.now },
});

module.exports = mongoose.model('GPS', schema);
