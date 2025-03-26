const mongoose = require("mongoose");

const emailSchema = new mongoose.Schema({
  sender: String,
  subject: String,
  body: String,
  isPhishing: Boolean, // True if it's a phishing email
});

module.exports = mongoose.model("Email", emailSchema);
