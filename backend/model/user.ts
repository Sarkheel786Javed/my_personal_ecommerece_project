import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
    },
    answer: {
      type: String,
    },
    phoneNumbber: {
      type: String,
    },
    addressLine1: {
      type: String,
    },
    city: {
      type: String,
    },
    country: {
      type: String,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
    },
    Organization: {
      type: String,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
