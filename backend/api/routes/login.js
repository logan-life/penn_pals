const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate.js');
const User = require('../../schemas/User.js');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// @desc    get a user document by supplying a jwt in a cookie 
// @route   GET api/login
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    //search for the user 
    const user = await User.findById(req.user.id);
    //return the user
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error.' });
  }
});

// @desc    Checks user credentials against the database, sets a cookie with the JWT in it
// @route   POST api/login
// @access  Public
router.post(
  '/',
  // express validator, only checking for existence
  [
    check('username', 'Username required').notEmpty(),
    check('password', 'Password required.').notEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
      let user = await User.findOne({ username });

      // Check to make sure that the user exists.
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'No user with that username exists.' }] });
      }

      // Check if user is locked out
      if(user.locked_out_until > Date.now()){
        //300000 is 5 mins in milliseconds
        //Date.now() returns the numeric value corresponding to the current time—the number of milliseconds elapsed since January 1, 1970 00:00:00 UTC, with leap seconds ignored. 
        await user.updateOne({locked_out_until:(Date.now()+300000)},{upsert:true});
        await user.save();
        return res
          .status(400)
          .json({ errors: [{ msg: 'Please wait 5 mins from now before attempting to log in again' }] });
      }

      // Compare the given password to the user's password.
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        const current_tries = user.attempts_with_wrong_password + 1;
        await user.updateOne({attempts_with_wrong_password:current_tries},{upsert:true});
        await user.save();
        if (current_tries >= 3){
          await user.updateOne({locked_out_until:(Date.now()+300000)},{upsert:true});
          await user.save();
          return res
            .status(400)
            .json({ errors: [{ msg: "That's 3 attempts - you're locked out. Wait 5mins before trying again" }] });
        }
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid password' }] });
      }
    // If user has now correctly logged in, set number of incorrect attempts back to 0
    await user.updateOne({attempts_with_wrong_password:0},{upsert:true});
    // If user has now correctly logged in, set online flag to true
    await user.updateOne({online:true},{upsert:true});
    await user.save();
    // Payload is the user record's _id field in Mongoose 
    const payload = {
        user: {
          id: user.id
        }
      };
      //sign the token, story it in a cookie and return the cookie
      jwt.sign(
        payload, 'this is a secret', { expiresIn: '3h' }, (err, token) => {
          if (err) throw err;
           res.cookie('token', token, { httpOnly: true, maxAge: 10800000});
           res.json({ token });
       
        }
      );
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;