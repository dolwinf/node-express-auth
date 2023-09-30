const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  auth_provider: { type: String, required: true },
});

module.exports = mongoose.model("User", userSchema);
