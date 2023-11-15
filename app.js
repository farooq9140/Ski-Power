const express = require('express');
const bodyParser = require('body-parser');
var Info = require('./security/info');
var cors = require('cors');
var path = require('path');

const app = express();

/**
 *  App Configuration
 */

// mongodb when running locally
var config = { "mongodb": "mongodb://localhost:27017/database-" + Info.app.code };

if (process && process.env && process.env.MONGO_USER && process.env.MONGO_HOST && process.env.MONGO_PASS) {
  config = {
    "mongo": {
      "user": process.env.MONGO_USER,
      "host": process.env.MONGO_HOST,
      "pass": process.env.MONGO_PASS
    }
  }
}
var mongodb_connection = "";
if (config.mongodb) {
  mongodb_connection = config.mongodb;
} else {
  mongodb_connection = "mongodb+srv://" + config.mongo.user + ":" + encodeURIComponent(config.mongo.pass) + "@" + config.mongo.host;
}

var mongoose = require('mongoose');
mongoose.connect(mongodb_connection, { promiseLibrary: require('bluebird'), useFindAndModify: false, useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('                   DB connection successful');
    console.log('********************************************************************');
  })
  .catch((err) => console.error('DB connection failed', err));

var routeAPI = require('./routes/api/api');
var routeAPISystem = require('./routes/api/system');
var routeAPIUsers = require('./routes/api/users');
var routeAPIActivities = require('./routes/api/activity');

app.use(bodyParser.json({ limit: '200mb' }));
app.use(bodyParser.urlencoded({
  parameterLimit: 100000,
  limit: '200mb',
  extended: true
}));

app.use(cors());
var allowCrossDomain = function (req, res, next) {
  if ('OPTIONS' == req.method) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    res.send(200);
  }
  else {
    next();
  }
};
app.use(allowCrossDomain);

app.use('/api', routeAPI);
routeAPI.use('/system', routeAPISystem);
routeAPI.use('/users', routeAPIUsers);
routeAPI.use('/activity', routeAPIActivities);

if (process.env.NODE_ENV === 'production' && process.env.REACT_STATIC) {
  app.get('/', (req, res) => {
    res.sendFile(path.resolve(`${process.env.REACT_STATIC}/index.html`));
  });
  
  // Serve production assets from client
  app.use(express.static(`${process.env.REACT_STATIC}`));

  // Serve index.html if no route recognized
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(`${process.env.REACT_STATIC}/index.html`));
  });
}

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({ error: err });
});

module.exports = app;