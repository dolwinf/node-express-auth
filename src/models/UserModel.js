const mongoose = require("mongoose");
const Schema = mongoose.Schema

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  auth_provider: { type: String, required: true },
  createdAt: Date,
  updatedAt: Date,
  postsHistory: [{
    type: Schema.Types.ObjectId,
    ref: 'Posts' 
  }]
});

module.exports = mongoose.model("User", userSchema);
