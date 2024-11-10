import { Request, Response } from "express";
const JWT = require("jsonwebtoken");
import userModel from "../../model/user";
// const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const DepartmentRequestModel = require("../../model/DepartmentRequest/DepartmentRequest");
// const isValidObjectId = (id: string): boolean => {
//   return objectIdRegex.test(id);
// };
interface User {
  _id: string;
  userName: string;
  phoneNumbber: string;
  addressLine1: string;
  city: string;
  country: string;
  email: string;
  Organization: string;
}
export const UserRequestDepartmentController = async (
  req: Request,
  res: Response
) => {
  try {
    const { departmentRequest } = req.params;
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .send({ message: "Authorization token is missing or invalid" });
    }
    const token = authHeader.split(" ")[1];
    const decodedToken = JWT.verify(token, process.env.JWT_SECRET) as User;

    const user = await userModel.findById(decodedToken._id);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    const DepartmentRequest = new DepartmentRequestModel({
      departmentRequest,
      userId: user._id,
      organization: user.Organization,
      organizationUserName: user.userName,
    })
    
    await DepartmentRequest.save();
    res.status(201).json({
      response: true,
      message: "Request for department sent successfully",
      // product: newProduct,
    });
  } catch (error) {
    console.error("Error creating Request Department:", error);
    res.status(500).send({
      success: false,
      error,
      message: "Error creating Request Department",
    });
  }
};


export const AdminGetRequestDepartmentController = async (
  req: Request,
  res: Response
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .send({ message: "Authorization token is missing or invalid" });
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = JWT.verify(token, process.env.JWT_SECRET) as User;

    const user = await userModel.findById(decodedToken._id);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    let departmentRequests;
    if (user.Organization === "Admin") {
      // Fetch all department requests if the user's organization is "Admin"
      departmentRequests = await DepartmentRequestModel.find();
    }
    //  else {
    //   // Fetch department requests related only to this specific user
    //   departmentRequests = await DepartmentRequestModel.find({ userId: user._id });
    // }

    res.status(200).json({
      success: true,
      data: departmentRequests,
      message: "Department requests fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching department requests:", error);
    res.status(500).send({
      success: false,
      error,
      message: "Error fetching department requests",
    });
  }
};