import mongoose from "mongoose";

const DepartmentRequestModel = new mongoose.Schema({
  departmentRequest: {
    type: Boolean,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  organization: {
    type: String,
    required: true,
  },
  organizationUserName: {
    type: String,
    required: true,
  }
});

module.exports = mongoose.model("DepartmentRequest", DepartmentRequestModel);
