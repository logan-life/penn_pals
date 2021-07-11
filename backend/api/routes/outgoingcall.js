const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate.js");
const User = require("../../schemas/User.js");

// @desc    get a user document by supplying a jwt in a cookie. poll the outgoing_call_active fields
// @route   GET api/outgoingcall
// @access  Private
router.get("/", authenticate, async (req, res) => {
  try {
    //search for the user
    const user = await User.findById(req.user.id);
    res.status(200).json({
      outgoing_call_active: user.outgoing_call_active,
    });
  } catch (err) {
    // console.error(err.message);
    res.status(500).json({ msg: "Server error." });
  }
});

// @desc    lookup a contact's user doc and check if they are offline or already on a call
// @route   POST api/outgoingcall
// @access  Private
router.post("/", authenticate, async (req, res) => {
  const { contactName } = req.body;

  try {
    let contact = await User.findOne({ username: contactName });
    res.status(200).json({
      online: contact.online,
      outgoing_call_active: contact.outgoing_call_active,
    });
  } catch (err) {
    // console.error(err.message);
    res.status(500).json({ msg: "Server error." });
  }
});

// @desc   set a user's outgoing_call_active field to true
// @route   PUT api/outgoingcall
// @access  Private
router.put("/", authenticate, async (req, res) => {
  const { username } = req.body;

  try {
    let user = await User.findOne({ username: username });
    user.outgoing_call_active = true;
    await user.save();
    res.status(200).send("Set outgoing call active to true.");
  } catch (err) {
    // console.error(err.message);
    res.status(500).json({ msg: "Server error." });
  }
});

// @desc   set a user's outgoing_call_active field to false
// @route   DELETE api/outgoingcall
// @access  Private
router.delete("/", authenticate, async (req, res) => {
  const { username } = req.body;
  try {
    let user = await User.findOne({ username: username });
    user.outgoing_call_active = false;
    await user.save();
    res.status(200).send("Set outgoing call active to false.");
  } catch (err) {
    // console.error(err.message);
    res.status(500).json({ msg: "Server error." });
  }
});
module.exports = router;
