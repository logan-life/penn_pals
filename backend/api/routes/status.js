const express = require('express');
const router = express.Router();
const authenticate = require("../middleware/authenticate.js");
const upload = require("../middleware/upload.js"); 
const singleUpload = upload.single('image')
const User = require('../../schemas/User.js');

// @route   PUT api/status
// @desc    Upload user status
router.put('/', authenticate, async (req, res) => {
    const userid = req.user;
    try {
        const user = await User.findById(userid.id);    
        const upload_time = Date.now();
        let statusObject;
        singleUpload(req, res, function(err) {
            if (req.fileValidationError) {
                return res.status(400).send(req.fileValidationError);
            }
            else if (err) {
                try {
                    const error_tt = err.code;
                    if (error_tt == "LIMIT_FILE_SIZE")
                        return res.status(413).send(err.message);
                    return res.status(400).send(err);    
                } catch (error) {
                    return res.status(551).send(err);
                }
                
            }
            else if (!req.file) {
                if (req.body.type === 'image')
                    return res.status(400).send('Please select an image to upload');
                else {
                    statusObject = {
                        username:user.username,
                        firstname:user.firstname,
                        lastname:user.lastname,
                        type:req.body.type,
                        text:req.body.text,
                        image:"",
                        url:req.body.url,
                        upload_time:upload_time
                    };
                    user.status = statusObject; 
                    user.save();                
                    return res.status(200).send('Successful upload');
                }
            }
            statusObject = {
                username:user.username,
                firstname:user.firstname,
                lastname:user.lastname,
                type:req.body.type,
                text:"",
                image:req.file.location,
                url:"",
                upload_time:upload_time
            };
            user.status = statusObject; 
            user.save();
            return res.status(200).send('Successful upload');
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
})


// @desc    set status seen to true
// @route   POST api/status
// @access  Private
router.post("/", authenticate, async (req, res) => {
    const userid = req.user;
    try {
        let user = await User.findById(userid.id);
        const { contact_username, status_id} = req.body;
        const currentUserContactElement = user.contacts
        .filter(function (contacts) {
          return contacts.username === contact_username;
        })
        .pop();            
        if (currentUserContactElement.status_id===status_id){
            currentUserContactElement.status_seen = true;
        }
        user.save();
        res.status(200).json("Status_seen updated");
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// @desc    get list of statuses to display
// @route   GET api/status
// @access  Private
router.get("/", authenticate, async (req, res) => {
    const userid = req.user;
    try {
        let user = await User.findById(userid.id);
        let contact_obj = new Array();
        contact_obj = user.contacts;
        let status_array = new Array();
        let contactUserDocument;
        let currentUserContactElement;
        //extract the username from the contact objects, and look up their status object
        for (let i = 0; i < contact_obj.length; i++) {         
            currentUserContactElement = user.contacts
            .filter(function (contacts) {
              return contacts.username === contact_obj[i].username;
            })
            .pop();
            contactUserDocument = await User.findOne({ username:contact_obj[i].username});
            if(currentUserContactElement.hidden===false && contactUserDocument.active_status===true){          
                if(contactUserDocument.status){
                    if(contactUserDocument.status.id === currentUserContactElement.status_id){
                        if (currentUserContactElement.status_seen === false){
                            status_array.push(contactUserDocument.status);
                        } 
                    } else {
                        currentUserContactElement.status_id = contactUserDocument.status.id;
                        currentUserContactElement.status_seen = false;
                        status_array.push(contactUserDocument.status);
                    }
                }
            }
        }
        user.save();

        status_array = status_array.sort((a, b) => {
            let time_a = a.upload_time,
            time_b = b.upload_time;
            if (time_a < time_b) {
                return 1;
            }
            if (time_a > time_b) {
                return -1;
            }
            return 0;
        });
        res.status(200).json(status_array);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

module.exports = router;