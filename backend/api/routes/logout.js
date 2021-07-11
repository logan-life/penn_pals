const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate.js');
const User = require('../../schemas/User.js');

// @desc    Clears the httpCookie used for authentication, and clears username from localStorage
// @route   POST api/logout
// @access  Public
router.get('/', authenticate, async (req, res) => {
        try {
            //search for the user 
            const user = await User.findById(req.user.id);
            // Set online flag to false
            await user.updateOne({online:false},{upsert:true});
            await user.save();
            res.clearCookie('token');
            res.status(200).send('Logout successful');
        } catch (err) {
            console.error(err);
            res.status(500).send('Server Error');
        }
    }
);

module.exports = router;