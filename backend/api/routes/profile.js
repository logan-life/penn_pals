const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate.js');
const User = require('../../schemas/User.js');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');

// @desc    Retrieves user info by the token from the cookie 
// @route   GET api/profile
// @access  Public
router.get('/', authenticate, async (req, res) => {
        try {
            const tok = await req.cookies.token;
            const user = await User.findById(req.user.id);
            res.json(user);
             
        } catch (err) {
            console.error(err);
             res.status(500).send('Server Error');
        }
    }
);
// @desc    Changes status of users account
// @route   PUT api/profile
// @access  Public
router.put('/', authenticate, async (req, res) => {
      const userid = req.user.id;
      const password  = req.body.password;
      try {
        let user =await User.findById( {_id:userid} );
        //check if the password provided is the same password as on the record 
        const isMatch = await bcrypt.compare(password, user.password);
  
        if (!isMatch) {
          return res.status(400).json({ errors: [{ msg: "Incorrect password" }] });
        }
        else{
            let user = await User.findByIdAndUpdate(
                {_id:userid} ,
               { active_status: "false" },
               function(err, result) {
                 if (err) {
                   res.send(err);
                 } else {
                   res.status(200).send(result);
                 }
               }
             );
        }

      } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
      }
    }
  );

module.exports = router;