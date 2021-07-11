const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate.js");
const User = require("../../schemas/User.js");

// @desc    get a user document by supplying a jwt in a cookie. poll the incoming_call field
// @route   GET api/incomingcall
// @access  Private
router.get("/", authenticate, async (req, res) => {
  try {
    //search for the user
    const user = await User.findById(req.user.id);
    res.status(200).json({
      incoming_call: user.incoming_call,
      //   outgoing_call_active: user.outgoing_call_active,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error." });
  }
});

// @desc    save the caller's name into the callee's `incoming_call` field
// @route   POST api/incomingcall
// @access  Private
router.post("/", authenticate, async (req, res) => {
  const { callerName, calleeName } = req.body;

  try {
    let callee = await User.findOne({ username: calleeName });
    callee.incoming_call = callerName;
    await callee.save();
    res.status(200).send("Saved callername.");
  } catch (err) {
    // console.error(err.message);
    res.status(500).json({ msg: "Server error." });
  }
});

// @desc   looks up the username's userdocument and clears the incoming_call field
// @route   DELETE api/incomingcall
// @access  Private
router.delete("/", authenticate, async (req, res) => {
  const { userToClear } = req.body;
  try {
    let user = await User.findOne({ username: userToClear });
    user.incoming_call = "";
    await user.save();
    res.status(200).send("Cleared incoming call field.");
  } catch (err) {
    // console.error(err.message);
    res.status(500).json({ msg: "Server error." });
  }
});

module.exports = router;
