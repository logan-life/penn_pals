const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate.js');
const User = require('../../schemas/User.js');
const bcrypt = require('bcrypt');
const { validationResult, body } = require('express-validator');

// @desc    Change password of a user
// @route   POST api/changePassword
// @access  Public
router.put('/', authenticate, async (req, res) => {
    //retreieve all information from the request
    const userid = req.user.id;
    let oldpwd = req.body.password;
    let newpwd = req.body.newPassword;
    // Encrypt the new password
    const salt = await bcrypt.genSalt(10);
    const encrypt_pwd = await bcrypt.hash(newpwd, salt);
    //encrypt the old password
    try {
        let confirm = await User.findById( {_id:userid} );
    // Compare the old password to the current user's password.
      const isMatch = await bcrypt.compare(req.body.password, confirm.password);
      //if not a match throw an error 
      if(!isMatch){
        return res.status(400).send('Incorrect current password');
      }
      //if a match - let user update the password 
      else{
        let user = await User.findByIdAndUpdate(
             {_id:userid} ,
            { password: encrypt_pwd },
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