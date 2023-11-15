'use strict';

var Jwt = require('jsonwebtoken');
var Info = require('./info');

var User = require('../models/user');
var Log = require('../models/log');

exports.isAuthenticated = function (req, res, next) {
    // check header or url parameters or post parameters for token
    const token = req.body.token || req.query.token || req.headers['x-access-token'];
    // decode token
    if (token) {
        // verifies secret
        Jwt.verify(token, Info.secret, function (err, decoded) {
            if (err) {
                res.statusCode = 400;
                return res.json({ statuscode: res.statusCode, api: req.originalUrl, error: `${err}` });
            } else {
                //Eventually add expiration of time.
                User.findOne({ _id: decoded.user_id })
                    .then((user) => {
                        if (user) {
                            req.decoded = decoded;
                            // Log button click
                            logUser(req);
                            next();
                        } else {
                            const error = `Invalid token.`
                            res.statusCode = 203;
                            return res.json({ api: req.originalUrl, error: error });
                        }
                    })
                    .catch((error) => {
                        res.statusCode = 203;
                        return res.json({ api: req.originalUrl, error: error });
                    });
            }
        });
    } else {
        const error = `No token provided.`
        console.log(error)
        res.statusCode = 203;
        return res.json({ api: req.originalUrl, error: error });
    }
}

const logUser = async (req) => {
    const { method, url, params, query, baseUrl, decoded } = req;

    // Only log GET methods
    const methods = ["GET"]

    if(methods.includes(method)) {
        let log = new Log();
        log.user = decoded.user_id;
        log.method = method;
        log.url = url;
        log.baseUrl = baseUrl;
        log.params = params;
        log.query = query;
        await log.save();
    }
}
