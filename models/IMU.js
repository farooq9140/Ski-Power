'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var IMUDataSchema = new Schema({
  gyro: {
    x: { type: Number },
    y: { type: Number },
    z: { type: Number },
  },
  accel: {
    x: { type: Number },
    y: { type: Number },
    z: { type: Number },
  },
  timestamp: { type: Number }
});

var schema = new Schema({
  IMUdata: { type: [IMUDataSchema]},
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  activity: { type: Schema.Types.ObjectId, ref: 'Activity' },
  creationdate: { type: Date, default: Date.now },
  modifieddate: { type: Date, default: Date.now },
});

module.exports = mongoose.model('IMU', schema);
