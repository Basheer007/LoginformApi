const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: "Username required", unique: true },
  password: {
    type: String,
    required: "password required",
    minlength: 5,
  },
});

const userAuth = mongoose.model("userLogin", UserSchema);
module.exports = userAuth;
