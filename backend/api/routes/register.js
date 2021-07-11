const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { validationResult, body } = require("express-validator");
const User = require("../../schemas/User.js");
const gravatar = require("gravatar");

// @route   POST api/users
// @desc    User Registration
router.post(
  "/",
  //express validator, checks that the fields are present in the request body
  [
    body(
      "username",
      "Username requirements: between 4 and 20 characters, letters and numbers only"
    )
      .isAlphanumeric()
      .isLength({ min: 4, max: 20 }),
    body(
      "password",
      "Password requirements: between 8 and 20 characters, letters and numbers only"
    )
      .isAlphanumeric()
      .isLength({ min: 8, max: 20 }),
    body("email", "Please enter a valid email address").notEmpty().isEmail(),
    body("firstname", "Please enter first name, letters only")
      .isAlpha()
      .notEmpty(),
    body("lastname", "Please enter last name, letters only")
      .isAlpha()
      .notEmpty(),
    body("security_question", "Please select secret question").notEmpty(),
    body("security_answer", "Please enter secret answer").notEmpty(),
  ],

  async (req, res) => {
    //check if there are errors in the validation result, abort and return errors if so
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    //grab fields from request body and create User params

   let {
      username,
      firstname,
      lastname,
      password,
      security_question,
      security_answer,
      email,
      avatar,
    } = req.body;

    try {
      //check the DB for the username to ensure one does not already exist
      let user = await User.findOne({ username });

      if (user) {
        return res
          .status(409)
          .json({ errors: [{ msg: "User already exists: " + username }] });
      }
      // Get/create an avatar
      const avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mp",
        protocol: "https",
      });
      //create the new User
      const register_time = Date.now();

      const active_status = true;
      //setting num of incorrect passwords entered to 0
      const attempts_with_wrong_password = 0;
      //setting time until when user is locked out to now
      const locked_out_until = Date.now();

      const online = false;
      

      // Encrypt the password
      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);

      //save the new User to the DB. When completed, Mongoose assigns a _id field.
      try {
        user = new User({ username, firstname, lastname, password, security_question, security_answer, register_time, active_status, attempts_with_wrong_password, locked_out_until, email, avatar,online});   
        await user.save();
      } catch (error) {
        res.status(550).send("Database Error");
      }
      return res.status(201).json({ msg: "Success" });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server Error");
    }
  }
);

module.exports = router;
