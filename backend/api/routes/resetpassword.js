const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate.js');
const User = require('../../schemas/User.js');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');


// @desc    Retrieve security question of a given user 
// @route   POST api/changePassword
// @access  Public
router.post('/', async (req, res) => {
    try {
        const username = req.body.user;
        let user = await User.findOne({ username });
        if(user===undefined||user===null){
          res.status(400).send('This user is not registered');
        }
        else{
        res.json(user);
        }
         
    } catch (err) {
        console.error(err);
         res.status(500).send('Server Error');
    }
}
);

// @desc    Change password of a user
// @route   PUT api/changePassword
// @access  Public
router.put('/',  async (req, res) => {
    //retreieve all information from the request
    let newpwd = req.body.password;
    let answer = req.body.answer;
    let user = req.body.user;
    // Encrypt the new password
    const salt = await bcrypt.genSalt(10);
    const encrypt_pwd = await bcrypt.hash(newpwd, salt);
    try {
        let confirm =  await User.findOne( {username:user} );
    // Compare the answer to security question to the one in database
    //if not a match throw an error 
      if(confirm.security_answer!==answer){
        return res.status(400).send('Incorrect answer to security answer');
      }
      //if a match - let user update the password 
      else{
        let userId = await User.findOneAndUpdate(
             {username:user} ,
            { password: encrypt_pwd },
            function(err, result) {
              if (err) {
                res.send(err);
              } else {
                res.status(200).send(result);
              }
            });
          }
    } catch (err) {
        // console.error(err);
         res.status(500).send('Server Error');
    }
}
);

module.exports = router;