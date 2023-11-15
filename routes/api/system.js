'use strict';

var express = require('express');
var router = express.Router();
const bcrypt = require('bcryptjs');
var Info = require('../../security/info');

var User = require('../../models/user');

router.patch('/skipowerinitialize-20211219', async function (req, res, next) {
    try {
        const birthday = new Date(Date.UTC(1997, 10, 6, 0, 0, 0)); // month - 1
        
        await getUser(next, 'SkiPower', '', 'skipower', 'p123456789assword', 'nickgidaro@hotmail.com', birthday);
        await getUser(next, 'Nicholas', 'Gidaro', 'ngidaro', '123', 'ngidaro@hotmail.com', birthday);

        res.json("OK");
    }
    catch (err) {
        if (err) {
            console.error(err);
            return next(err);
        }
    }
});

var getUser = async function (next, firstname, lastname, username, password, email, birthday) {
    try {
        var user = await User.findOne({ username: username })
            .select('_id')
            .exec();
        if (!user) {
            user = new User();
            user.firstname = firstname;
            user.lastname = lastname;
            user.username = username;
            user.password = password;
            user.email = email;
            user.birthday = birthday;
            const encryptedpassword = await bcrypt.hash(password, Info.saltRounds);
            if (encryptedpassword) {
                user.password = encryptedpassword;
            }
            var savedUser = await user.save();
            if (savedUser) {
                console.log('Generated user...');
                return savedUser;
            } else {
                const err = 'Error saving';
                console.error(err);
            }
        }
        else {
            return user;
        }
    }
    catch (err) {
        if (err) {
            console.error(err);
            return next(err);
        }
    }
}

module.exports = router;
