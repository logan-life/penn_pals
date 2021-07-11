const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate.js');
const User = require('../../schemas/User.js');
const { check, validationResult } = require('express-validator');


// @desc    Update the last interraction date
// @route   PUT api/latestconvo
// @access  Public
router.put('/',  authenticate, async (req, res) => {
    //retreieve all information from the request
    let date = req.body.date;
    let receiver = req.body.receiver;
    try {
        const user = await User.findOne({username:req.body.user});
        res.json(user);
        for(let i = 0; i < user.contacts.length;i++){
            if(user.contacts[i].username===receiver){
                user.contacts[i].last_interaction = date;
            }
        }
        user.save();
    } catch (err) {
        console.error(err);
        console.log(err);
         res.status(500).send('Server Error');
    }
}
);

module.exports = router;