const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate.js');
const User = require('../../schemas/User.js');

// @desc    get a contact suggestion - a contact who is active on the app and not in current list of contacts
// @route   GET api/contactsuggest
// @access  Private
router.get('/', authenticate, async (req, res) => {
    const userid = req.user;
    try {
        //get all the active users on the app
        let allUsers = new Array(); 
        let allUsernames = new Array();
        allUsers = await User.find({'active_status':true});
        for (let i = 0; i < allUsers.length; i++){
            let elem = allUsers[i].username;
            allUsernames.push(elem);
        }
        //get all of the current user's contacts
        let user = await User.findById(userid.id);
        let contact_obj = new Array();
        contact_obj = user.contacts;
        let contact_arr = new Array(); 
        for (let i = 0; i < contact_obj.length; i++){
            if (contact_obj[i].hidden===false){
                let elem = contact_obj[i].username;
                contact_arr.push(elem);
            }
        }
        //find all the users on the app who are not the current user's contacts
        const contactSuggestionList = allUsernames.filter( function( elem ) {
            return contact_arr.indexOf( elem ) < 0;
        });       
        //remove current user as a contact suggestion
        const index = contactSuggestionList.indexOf(user.username);
        if (index > -1) {
            contactSuggestionList.splice(index, 1);
        }
        //set user in contact suggestion list as contact suggestion
        let contactSuggestion = {
            "firstname":"",
            "lastname":"",
            "username":"",
            "avatar":"",
            "conversation_sid":""
        }
        if(contactSuggestionList.length>0) {
            const contactToSuggest = await User.findOne({ "username":contactSuggestionList[0]});
            contactSuggestion.firstname =  contactToSuggest.firstname;
            contactSuggestion.lastname =  contactToSuggest.lastname;
            contactSuggestion.username =  contactToSuggest.username;
            contactSuggestion.avatar =  contactToSuggest.avatar;
            const currentContactDetails = user.contacts
            .filter(function (searchContact) {
              return searchContact.username === contactToSuggest.username;
            })
            .pop();      
            if(currentContactDetails){
              contactSuggestion.conversation_sid = currentContactDetails.conversation_sid;
            }
        }
        res.status(200).json(contactSuggestion);    
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
}
);

module.exports = router;