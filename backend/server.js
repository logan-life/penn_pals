const express = require("express");
const bodyParse = require("body-parser");
const webapp = express();
const cookieParser = require("cookie-parser");
const path = require("path");

webapp.use(express.static(path.resolve(__dirname, "../react-ui/build")));

webapp.use(bodyParse.json());
webapp.use(bodyParse.urlencoded({ extended: true }));
webapp.use(cookieParser());

webapp.use("/api/register", require("./api/routes/register"));
webapp.use("/api/login", require("./api/routes/login"));
webapp.use("/api/logout", require("./api/routes/logout"));
webapp.use("/api/contacts", require("./api/routes/contacts"));
webapp.use("/api/profile", require("./api/routes/profile"));
webapp.use("/api/changePassword", require("./api/routes/changepwd"));
webapp.use("/api/contactsuggest", require("./api/routes/contactsuggest"));
webapp.use("/api/resetPassword", require("./api/routes/resetpassword"));
webapp.use("/api/status", require("./api/routes/status"));
webapp.use("/api/contactsuggest", require("./api/routes/contactsuggest"));
webapp.use("/api/twilio", require("./api/routes/twilio"));
webapp.use("/api/latestconvo", require("./api/routes/latestconvo"));
webapp.use("/api/incomingcall", require("./api/routes/incomingcall"));
webapp.use("/api/outgoingcall", require("./api/routes/outgoingcall"));

module.exports = webapp;
