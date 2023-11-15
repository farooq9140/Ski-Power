'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  totaltime: { type: Number },
  
  phoneGPS: { type: Schema.Types.ObjectId, ref: 'PhoneGPS' }, // GPS ID of the data from the phone
  IMU: { type: Schema.Types.ObjectId, ref: 'IMU' },
  loadcell: { type: Schema.Types.ObjectId, ref: 'Loadcell' },
  GPS: { type: Schema.Types.ObjectId, ref: 'GPS' }, // GPS ID of the data from the module

  creationdate: { type: Date, default: Date.now },
  modifieddate: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Activity', schema);
