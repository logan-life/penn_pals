const express = require("express");
const router = express.Router();
const AccessToken = require("twilio").jwt.AccessToken;
const ChatGrant = AccessToken.ChatGrant;
const VideoGrant = AccessToken.VideoGrant;

// Used when generating any kind of tokens
const twilioAccountSid = "ENTER HERE";
const twilioApiKey = "ENTER HERE";
const twilioApiSecret = "ENTER HERE";

// Used specifically for creating Chat tokens
const serviceSid = "ENTER HERE";

// @desc   Provides a Chat Access Token given the username of the requester
// @route   GET api/twilio
// @access  Private
router.get("/", function (req, res) {
  const identity = req.query.username;

  // Create a "grant" which enables a client to use Chat as a given user,
  // on a given device
  const chatGrant = new ChatGrant({
    serviceSid: serviceSid,
  });

  // Create an access token which we will sign and return to the client,
  // containing the grant we just created
  const token = new AccessToken(
    twilioAccountSid,
    twilioApiKey,
    twilioApiSecret,
    { identity: identity }
  );

  token.addGrant(chatGrant);
  // Serialize the token to a JWT string
  res.send(token.toJwt());
});

router.post("/", function (req, res) {
  const identity = req.body.identity;
  const room = req.body.room;
  const token = videoToken(identity, room);
  sendTokenResponse(token, res);
});

const sendTokenResponse = (token, res) => {
  res.set("Content-Type", "application/json");
  res.send(
    JSON.stringify({
      token: token.toJwt(),
    })
  );
};

const generateToken = () => {
  return new AccessToken(twilioAccountSid, twilioApiKey, twilioApiSecret);
};

const videoToken = (identity, room) => {
  let videoGrant;
  if (typeof room !== "undefined") {
    videoGrant = new VideoGrant({ room });
  } else {
    videoGrant = new VideoGrant();
  }
  const token = generateToken();
  token.addGrant(videoGrant);
  token.identity = identity;
  return token;
};

module.exports = router;
