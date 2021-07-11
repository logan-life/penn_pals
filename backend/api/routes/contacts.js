const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate.js");
const User = require("../../schemas/User.js");

// @desc    add a new contact
// @params  contactToAdd always. conversationSid optional -- no Sid means we are unhidiing a contact rather than making a new one. If there's a Sid, that means they created a brand new conversation on the front end.
// @route   PUT api/contacts
// @access  Private
router.put("/", authenticate, async (req, res) => {
  //this is not passed in, it comes back from the authenticate middleware which generates it by checking the token.
  const userid = req.user;

  const { contactToAdd, conversationSid } = req.body;
  try {
    //find the user.User
    let user = await User.findById(userid.id);
    // find the contact.User
    let contact = await User.findOne({ username: contactToAdd });
    // Check to make sure that the contact exists in the Users collection
    if (!contact) {
      return res.status(404).send("No contact with that username exists");
    }
    // An empty conversationSid suggests that the user is a hidden contact
    if (conversationSid === "") {
      // Confirm contact to be added is a hidden contact
      //check the user.User contact array and see if there's a name in there that matches the requested contact.User.
      // if this is true, then the contact.User has already added the user.User as a contact, so we just need to flip the bit and unhide the contact.User in the user.User contact array.
      const check_contact = user.contacts
        .filter(function (contacts) {
          return contacts.username === contactToAdd;
        })
        .pop();
      if (!check_contact) {
        return res.status(400).send("Not a hidden contact");
      }
      // Else flip hidden flag to false
      check_contact.hidden = false;
      user.save();
      return res.status(200).send("Contact Unhidden!");
    } else {
      // Creating a new contact.Contact with the provided new conversationSid to add to logged in user.User

      const new_contact = {
        username: contactToAdd,
        firstname: contact.firstname,
        lastname: contact.lastname,
        avatar: contact.avatar,
        conversation_sid: conversationSid,
        hidden: false,
        status_id: "",
        status_seen: false,
        last_interaction: Date.now(),
      };
      // Creating current user as a shadow contact for the contact being added
      const shadow_contact = {
        username: user.username,
        firstname: user.firstname,
        lastname: user.lastname,
        avatar: user.avatar,
        conversation_sid: conversationSid,
        hidden: true,
        status_id: "",
        status_seen: false,
        last_interaction: Date.now(),
      };
      // Adding new_contact and shadow_contact
      user.contacts.push(new_contact);
      user.save();
      contact.contacts.push(shadow_contact);
      contact.save();
      res.status(200).send("Contact added!");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// @desc    delete a contact
// @ params implicit is user.User (returned from authenticate middleware), contactToRemove in the body.
// @returns sets the hidden flag on the contactToRemove.contact object to true in the user.User contact array
// @route   DELETE api/contacts
// @access  Private
router.delete("/", authenticate, async (req, res) => {
  const userid = req.user;
  const { contactToRemove } = req.body;
  try {
    let user = await User.findById(userid.id);
    // Check to make sure that the user has the specified contact
    const check_contact = user.contacts
      .filter(function (contacts) {
        return contacts.username === contactToRemove;
      })
      .pop();
    if (!check_contact) {
      return res.status(400).send("Contact does not exist");
    }
    // Remove the contact
    check_contact.hidden = true;
    //user.contacts.pull({ _id: check_contact._id });
    await user.save();
    res.status(200).send("Contact deleted (made hidden)!");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// @desc    search for a contact and check if the search result is already a hidden contact
// @params  implicit is user.User (returned from authenticate middleware), explicit is contactToSearch.
// this function is used in the front end by the user to search for a new contact to add. if we find one, we also check if the contact we are search for already added US as a contact. If so, then there's a shadow record already in our array.
// that means we send back the extra info we need to then send in the Add request (if the user chooses to do so) which means including the conversationSid and a boolean to condition on in the front end to check for this possibility. not sure why we send back the hidden flag though.
// @route   POST api/contacts
// @access  Private
router.post("/", authenticate, async (req, res) => {
  //current user
  const userid = req.user;
  const { contactToSearch } = req.body;
  try {
    let user = await User.findById(userid.id);
    // set default responses
    let searchresult_contactExists = false;
    let searchresult_userName = "";
    let searchresult_firstName = "";
    let searchresult_lastName = "";
    let searchresult_avatar = "";
    let searchresult_active_status = false;
    let searchresult_current_contact = false;
    let searchresult_conversationSid = "";
    let searchresult_hidden = false;
    //Check to make sure that contactToSearch exists
    let searchContact = await User.findOne({ username: contactToSearch });

    if (searchContact) {
      searchresult_contactExists = true;
      searchresult_userName = searchContact.username;
      searchresult_firstName = searchContact.firstname;
      searchresult_lastName = searchContact.lastname;
      searchresult_avatar = searchContact.avatar;
      searchresult_active_status = searchContact.active_status;
      // Check to see if the contact.Contact exists in the user.User contact array
      const currentContactDetails = user.contacts
        .filter(function (searchContact) {
          return searchContact.username === contactToSearch;
        })
        .pop();
      if (currentContactDetails) {
        searchresult_current_contact = true;
        searchresult_conversationSid = currentContactDetails.conversation_sid;
        searchresult_hidden = currentContactDetails.hidden;
      }
    }
    res.status(200).json({
      contact_exists: searchresult_contactExists,
      username: searchresult_userName,
      firstname: searchresult_firstName,
      lastname: searchresult_lastName,
      avatar: searchresult_avatar,
      active_status: searchresult_active_status,
      current_contact: searchresult_current_contact,
      conversation_sid: searchresult_conversationSid,
      hidden: searchresult_hidden,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// @desc    get list of all of the logged-in user's contacts
// @route   GET api/contacts
// @access  Private
router.get("/", authenticate, async (req, res) => {
  const userid = req.user;
  try {
    let user = await User.findById(userid.id);
    let contact_obj = new Array();
    contact_obj = user.contacts;
    let contact_arr = new Array();

    //extract the username from the contact objects, and look up relevant details
    for (let i = 0; i < contact_obj.length; i++) {
      let elem = {
        firstname: contact_obj[i].firstname,
        lastname: contact_obj[i].lastname,
        username: contact_obj[i].username,
        avatar: contact_obj[i].avatar,
        conversation_sid: contact_obj[i].conversation_sid,
        hidden: contact_obj[i].hidden,
        last_interaction: contact_obj[i].last_interaction,
      };
      contact_arr.push(elem);
    }
    res.status(200).json(contact_arr);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
