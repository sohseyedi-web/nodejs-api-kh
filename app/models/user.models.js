const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    biography: { type: String },
  },
  {
    timestamps: true,
  }
);

module.exports = {
  UserModel: mongoose.model("User", UserSchema),
};
