import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      require: true,
    },
    answer: {
      type: String,
      require: true,
    },
    phoneNumbber: {
      type: String,
      require: true,
    },
    addressLine1: {
      type: String,
      require: true,
    },
    city: {
      type: String,
      require: true,
    },
    country: {
      type: String,
      require: true,
    },
    email: {
      type: String,
      require: true,
    },
    password: {
      type: String,
      require: true,
    },
    Organization: {
      type: String,
      default: "User",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
