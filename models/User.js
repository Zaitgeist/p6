const mongooseValidator = require("mongoose-unique-validator");
const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

userSchema.plugin(mongooseValidator);

module.exports = mongoose.model("User", userSchema);