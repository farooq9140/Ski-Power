var express = require('express');
var router = express.Router();
var jwt = require("jsonwebtoken"); // used to create, sign, and verify tokens
const bcrypt = require("bcryptjs");
var Info = require('../../security/info');
var { isAuthenticated } = require('../../security/authenticate');

var User = require('../../models/user');

router.get('/', isAuthenticated, async (req, res, next) => {
    try {
        const user = await User.findById(req.decoded.user_id)
            .select('_id firstname lastname username bio displayname email profilepicture birthday')
            .exec();

        res.json(user);
    }
    catch (err) {
        console.info(error);
        res.statusCode = 500;
        res.json({ statuscode: res.statusCode, api: req.originalUrl, error: `${error}` });
    }
});

router.get('/:id', isAuthenticated, async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id)
            .select('_id firstname lastname username bio displayname email profilepicture birthday')
            .exec();
        res.json(user);
    }
    catch (err) {
        console.info(error);
        res.statusCode = 500;
        res.json({ statuscode: res.statusCode, api: req.originalUrl, error: `${error}` });
    }
});

router.post('/login', async function (req, res, next) {
    try {
      const loginuser = await User.findOne({ username: req.body.username })
          .select('_id password firstname lastname username bio displayname email')
          .exec();

      if (loginuser && loginuser.password) {
          const passwordmatch = await bcrypt.compare(req.body.password, loginuser.password)
          if (passwordmatch) {
              //Create token payload
              const token = createToken(loginuser);
              res.statusCode = 200;
              res.json({ token: token, user: loginuser });
          }
          else {
              const error = `Invalid Email or Password.`
              res.statusCode = 400;
              res.json({ statuscode: res.statusCode, api: req.originalUrl, error: error });
          }
      }
      else {
          const error = `Invalid Email or Password.`
          res.statusCode = 400;
          res.json({ statuscode: res.statusCode, api: req.originalUrl, error: error });
      }
    }
    catch (error) {
        console.info(error);
        res.statusCode = 500;
        res.json({ statuscode: res.statusCode, api: req.originalUrl, error: `${error}` });
    }
});

router.post('/createaccount', async (req, res, next) => {
    const { email, firstname, lastname, password } = req.body;
    if (email, firstname, lastname, password) {
      signup(res, firstname, lastname, email, password);
    } else {
      const error = `One or more fields are empty.`;
      res.statusCode = 400;
      res.json({ error: error });
    }
});

const signup = async (res, firstname, lastname, email, password) => {
    const regexMatchEmail = new RegExp("^[A-Za-z0-9._@-]*$");
    const isEmailValid = email.match(regexMatchEmail);
    
    if (!isEmailValid) {
        const error = `Invalid Email`;
        res.statusCode = 400;
        res.json({ error: error });
        return;
    }
    const existingUser = await User.findOne({ email: { $regex : new RegExp("^" + email + "$", "i") } })
        .select('_id firstname, lastname, email')
        .exec();
    
    if (existingUser) {
        const error = `Email already exists`;
        res.statusCode = 400;
        res.json({ error: error });
        return;
    }

    const encryptedpassword = await bcrypt.hash(password, Info.saltRounds);
    
    const loginuser = await (new User({
        email: email,
        firstname: firstname,
        lastname: lastname,
        password: encryptedpassword,
    })).save();

    console.log("Generated User");

    const tok = createToken(loginuser);
    res.statusCode = 200;
    res.json({ token: tok, user: loginuser });
}

function createToken(user) {
    const payload = {
        user_id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
    };

    return jwt.sign(payload, Info.secret);
}

module.exports = router;
