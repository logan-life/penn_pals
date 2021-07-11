const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const contactSchema = new mongoose.Schema({
  username: {
    type: String,
  },
  firstname: {
    type: String,
  },
  lastname: {
    type: String,
  },
  avatar: {
    type: String,
  },
  conversation_sid: {
    type: String,
  },
  hidden: {
    type: Boolean,
  },
  status_id: {
    type: String,
  },
  status_seen: {
    type: Boolean,
  },
  last_interaction:{
    type:Date,
  }
});

const statusSchema = new mongoose.Schema({
  username: {
    type: String,
  },
  firstname: {
    type: String,
  },
  lastname: {
    type: String,
  },
  type: {
    type: String,
  },
  text: {
    type: String,
  },
  image: {
    type: String,
  },
  url: {
    type: String,
  },
  upload_time: {
    type: Date,
  },
});
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    require: true,
  },
  security_question: {
    type: String,
  },
  security_answer: {
    type: String,
  },
  avatar: {
    type: String,
  },
  register_time: {
    type: Date,
    default: Date.now,
  },
  active_status: {
    type: Boolean,
  },
  online: {
    type: Boolean,
  },
  attempts_with_wrong_password: {
    type: Number,
  },
  incoming_call: {
    type: String,
    default: "",
  },
  outgoing_call_active: {
    type: Boolean,
    default: false,
  },
  locked_out_until: {
    type: Date,
  },
  contacts: [contactSchema],
  status: statusSchema,
});

userSchema.methods.validatePassword = async function (inputPassword) {
  const hash = bcrypt.compare(inputPassword, this.password);
  return this.password === hash;
};

module.exports = mongoose.model("User", userSchema);
