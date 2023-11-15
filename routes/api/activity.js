var express = require('express');
var router = express.Router();
var { isAuthenticated } = require('../../security/authenticate');

var Activity = require('../../models/activity');
var PhoneGPS = require('../../models/phoneGPS');
var IMUSchema = require('../../models/IMU');
var LoadCell = require('../../models/loadcell');
var GPShardware = require('../../models/GPS');

// Get all activities
router.get('/', isAuthenticated, async (req, res, next) => {
    try {
        const activities = await Activity.find({user: req.decoded.user_id})
            .select('_id user totaltime phoneGPS IMU loadcell GPS creationdate modifieddate')
            .exec();

        res.json(activities);
    }
    catch (err) {
        console.info(error);
        res.statusCode = 500;
        res.json({ statuscode: res.statusCode, api: req.originalUrl, error: `${error}` });
    }
});

// Get activity data
router.get('/activitydata/:id', isAuthenticated, async (req, res, next) => {
    try {
      const IMU = await IMUSchema.findOne({activity: req.params.id})
          .select('_id IMUdata creationdate modifieddate')
          .exec();

      const loadcell = await LoadCell.findOne({activity: req.params.id})
          .select('_id loadcelldata creationdate modifieddate')
          .exec();

      const phoneGPS = await PhoneGPS.findOne({activity: req.params.id})
          .select('_id GPSdata creationdate modifieddate')
          .exec();

      const gps = await GPShardware.findOne({activity: req.params.id})
          .select('_id GPSdata creationdate modifieddate')
          .exec();

      res.json({IMU: IMU, loadcell: loadcell, phoneGPS: phoneGPS, GPS: gps});
    }
    catch (err) {
      console.info(err);
      res.statusCode = 500;
      res.json({ statuscode: res.statusCode, api: req.originalUrl, error: `${error}` });
    }
});

// Add New Activity
router.post('/newactivity', isAuthenticated, async function (req, res, next) {
  try {
    const { totaltime, phoneGPS, IMU, loadcell, GPS } = req.body;  // Will need to add more parameters like load cell data, IMU and GPS
    const newActivity = await new Activity();
    
    newActivity.user = req.decoded.user_id;

    if(totaltime)
      newActivity.totaltime = totaltime;
    if(phoneGPS)
      newActivity.phoneGPS = phoneGPS;
    if(IMU)
      newActivity.IMU = IMU;
    if(loadcell)
      newActivity.loadcell = loadcell;
    if(GPS)
      newActivity.GPS = GPS;

    const savedActivity = await newActivity.save();

    if(savedActivity) {
      res.statusCode = 200;
      res.json({ activity: savedActivity });
    } else {
      const error = `Fail to Save Activity`;
      res.statusCode = 400;
      res.json({ error: error });
      return;
    }
  }
  catch (error) {
      console.info(error);
      res.statusCode = 500;
      res.json({ statuscode: res.statusCode, api: req.originalUrl, error: `${error}` });
  }
});

// Update existing Activity
router.post('/updateactivity', isAuthenticated, async function (req, res, next) {
  try {
    const { totaltime, phoneGPS, IMU, loadcell, GPS } = req.body;

    const activity = await Activity.findByIdAndUpdate(req.body._id, {
      totaltime: totaltime || null,
      phoneGPS: phoneGPS || null,
      IMU: IMU || null,
      loadcell: loadcell || null,
      GPS: GPS || null,
      modifieddate: Date.now(),
    }, { new: true });

    if(activity) {
      res.statusCode = 200;
      res.json({ activity: activity });
    } else {
      // Activity does not exist
      const error = `Fail to Update Activity`;
      res.statusCode = 400;
      res.json({ error: error });
      return;
    }
  }
  catch (error) {
      console.info(error);
      res.statusCode = 500;
      res.json({ statuscode: res.statusCode, api: req.originalUrl, error: `${error}` });
  }
});

// Add/Update phoneGPS data
router.post('/phoneGPS', isAuthenticated, async function (req, res, next) {
  try {
    const { _id, GPSdata, activity } = req.body;

    // Check if GPS entry already exists:
    const GPSExists = await PhoneGPS.findById(_id);

    if(GPSExists) {
      const phoneGPS = await PhoneGPS.findByIdAndUpdate(_id, {
        $push: {'GPSdata': GPSdata },
        modifieddate: Date.now(),
      }, { new: true })
      .select('_id activity user')
      .exec();
  
      if(phoneGPS) {
        res.statusCode = 200;
        res.json({ phoneGPS: phoneGPS });
      } else {
        const error = `Fail to Update GPS Data`;
        res.statusCode = 400;
        res.json({ error: error });
        return;
      }
    } else {
      // Create a new GPS entry
      let savedPhoneGPS = await PhoneGPS({
        user: req.decoded.user_id,
        activity: activity,
        GPSdata: GPSdata || null,
      })
      .save();

      // Don't want to return the array of data
      savedPhoneGPS.GPSdata = undefined;

      if(savedPhoneGPS) {
        res.statusCode = 200;
        res.json({ phoneGPS: savedPhoneGPS });
      } else {
        // Activity does not exist
        const error = `Fail to Create New GPS Data`;
        res.statusCode = 400;
        res.json({ error: error });
        return;
      }
    }
  }
  catch (error) {
      console.info(error);
      res.statusCode = 500;
      res.json({ statuscode: res.statusCode, api: req.originalUrl, error: `${error}` });
  }
});

// One Time Post
// Save IMU - Loadcell - GPS data
router.post('/savehardwaredata', isAuthenticated, async function (req, res, next) {
  try {
    const { activity, imu, loadcell, gps } = req.body;

    let savedGPS;
    
    // Create a new IMU entry
    let savedIMU = await IMUSchema({
      user: req.decoded.user_id,
      activity: activity,
      IMUdata: imu.IMUdata,
    })
    .save();

    // Create a new Loadcell entry
    let savedLoadCell = await LoadCell({
      user: req.decoded.user_id,
      activity: activity,
      loadcelldata: loadcell.loadcelldata,
    })
    .save();

    if(gps) {
      // Create a new GPS entry
      savedGPS = await GPShardware({
        user: req.decoded.user_id,
        activity: activity,
        GPSdata: gps.GPSdata,
      })
      .save();
    }

    // Don't want to return the array of data
    savedIMU.IMUdata = undefined;
    savedLoadCell.loadcelldata = undefined;
    savedGPS.GPSdata = undefined;

    if(savedIMU && savedLoadCell && savedGPS) {
      res.statusCode = 200;
      res.json({ IMU: savedIMU, loadcell: savedLoadCell, GPS: savedGPS });
    } else {
      // Failed to save IMU and Loadcell
      const error = `Fail to Create New IMU - Loadcell GPS Entry`;
      res.statusCode = 400;
      res.json({ error: error });
      return;
    }
  }
  catch (error) {
      console.info(error);
      res.statusCode = 500;
      res.json({ statuscode: res.statusCode, api: req.originalUrl, error: `${error}` });
  }
});

module.exports = router;