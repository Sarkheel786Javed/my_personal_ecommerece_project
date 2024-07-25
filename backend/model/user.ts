import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    addressLine1: { type: String, required: true },
    phoneNumbber: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    answer: { type: String, required: true },
    refreshToken: { type: String, default: '' }, // Add this line
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
