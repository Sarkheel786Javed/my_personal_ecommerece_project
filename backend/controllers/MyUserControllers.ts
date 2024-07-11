import { Request, Response } from 'express';
import userModel from '../model/user';
const { hashPassword, comparePassword } = require("../helper/authHelper");
const JWT = require("jsonwebtoken");
const registerController = async (req: Request, res: Response) => {
    try {
        console.log('Request received:', req.body);
        const { user_name, email, password, addressLine1, city, country, answer, phoneNumbber } = req.body;

        // Validations
        if (!user_name) return res.status(400).send({ error: "User name is required" });
        if (!email) return res.status(400).send({ error: "Email is required" });
        if (!password) return res.status(400).send({ error: "Password is required" });
        if (!addressLine1) return res.status(400).send({ error: "Address is required" });
        if (!phoneNumbber) return res.status(400).send({ error: "Phone number is required" });
        if (!city) return res.status(400).send({ error: "City is required" });
        if (!country) return res.status(400).send({ error: "Country is required" });

        // Check user
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(200).send({
                success: false,
                message: "Already registered, please login",
            });
        }

        // Register user
        const hashedPassword = await hashPassword(password);
        const user = await new userModel({
            user_name,
            email,
            password: hashedPassword,
            addressLine1,
            phoneNumbber,
            city,
            country,
            answer,
        }).save();

        res.status(200).send({
            success: true,
            message: "User registered successfully",
            user,
        });
    } catch (error) {
        console.error('Error in registerController:', error);
        res.status(500).send({
            success: false,
            message: "Error in registration",
            error,
        });
    }
};
  //POST LOGIN
  const loginController = async (req:any, res:any) => {
    try {
      const { email, password } = req.body;
      //validation
      if (!email || !password) {
        return res.status(404).send({
          success: false,
          message: "Invalid email or password",
        });
      }
      //check user
      const user = await userModel.findOne({ email });
      if (!user) {
        return res.status(404).send({
          success: false,
          message: "Email is not registerd",
        });
      }
      const match = await comparePassword(password, user.password);
      if (!match) {
        return res.status(200).send({
          success: false,
          message: "Invalid Password",
        });
      }
      //token
      const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });
      res.status(200).send({
        success: true,
        message: "login successfully",
        user: {
          _id: user._id,
          user_name: user.user_name,
            email: user.email,
            addressLine1: user.addressLine1,
            phoneNumbber: user.phoneNumbber,
            city: user.city,
            country: user.country,
        },
        token,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Error in login",
        error,
      });
    }
  };
  
//   //forgotPasswordController
  
//   const forgotPasswordController = async (req, res) => {
//     try {
//       const { answer, email, password } = req.body;
//       if (!email) {
//         res.status(400).send({ message: "email is required" });
//       }
//       if (!answer) {
//         res.status(400).send({ message: "Father Name  is required" });
//       }
//       if (!password) {
//         res.status(400).send({ message: "New Password is required" });
//       }
  
//       //check
//       const user = await userModel.findOne({ email, answer });
//       //validation
//       const F_name = answer;
//       if (F_name !== answer) {
//         return res.status(404).send({
//           success: false,
//           message: "Father Name is not same ",
//         });
//       }
//       if (!user) {
//         return res.status(404).send({
//           success: false,
//           message: "Wrong Email Or FatherName",
//         });
//       }
//       const hashed = await hashPassword(password);
//       await userModel.findByIdAndUpdate(user._id, { password: hashed });
//       res.status(200).send({
//         success: true,
//         message: "Password Reset Successfully",
//       });
//     } catch (error) {
//       console.log(error);
//       res.status(500).send({
//         success: false,
//         message: "Something went wrong",
//         error,
//       });
//     }
//   };
  
//   //test controller
//   const testController = (req, res) => {
//     try {
//       res.send("Protected Routes");
//     } catch (error) {
//       console.log(error);
//       res.send({ error });
//     }
//   };
//   //get all users
//   const getAllUser = async (req, res) => {
//     try {
//       const user = await userModel
//         .find({})
//         .populate("fullName")
//         .select("-timestamps")
//         .sort({ createdAt: -1 });
//       res.status(200).send({
//         success: true,
//         counTotal: user.length,
//         message: " Get all User Details successfull",
//         user,
//       });
//     } catch (error) {
//       console.log(error);
//       res.status(500).send({
//         success: false,
//         message: "Error While Getting All User",
//         error: error.message,
//       });
//     }
//   };
  
  
//   // get single user
//   const getSingleuser = async (req, res) => {
//     try {
//       const userId = req.params.userId;
//       const user = await userModel.findById(userId);
  
//       if (!user) {
//         return res.status(404).json({
//           success: false,
//           message: "User not found",
//         });
//       }
  
//       // Decrypt the password (replace this with your decryption logic)
//       const decryptedPassword = user.password;
  
//       res.status(200).json({
//         success: true,
//         message: "Get user data successfully",
//         user: {
//           ...user._doc,
//           password: decryptedPassword,
//         },
//       });
//     } catch (error) {
//       console.log(error);
//       res.status(500).json({
//         success: false,
//         message: "Failed to get user data",
//         error: error.message,
//       });
//     }
//   };
  
//   const updateRegisterController = async (req, res) => {
//     try {
//       const { fullName, phoneNo, answer, email, password } = req.body;
//       const userId = req.params.id;
  
//       const user = await userModel.findById(userId);
  
//       if (!user) {
//         return res.status(404).json({
//           success: false,
//           message: "User not found",
//         });
//       }
  
//       // Password validation
//       if (password && password.length < 6) {
//         return res.status(400).json({
//           success: false,
//           message: "Password is required and must be at least 6 characters long",
//         });
//       }
  
//       // Validate and hash the password if provided
//       const hashedPassword = password ? await hashPassword(password) : undefined;
  
//       // Handle profile picture update
//       let newProfileImage = null;
  
//       if (req.file) {
//         newProfileImage = {
//           data: req.file.buffer,
//           contentType: req.file.mimetype,
//         };
//       }
  
//       // Update user data
//       const updateUser = await userModel.findByIdAndUpdate(
//         userId,
//         {
//           fullName: fullName || user.fullName,
//           phoneNo: phoneNo || user.phoneNo,
//           answer: answer || user.answer,
//           email: email || user.email,
//           password: hashedPassword || user.password,
//           authImage: newProfileImage || user.authImage,
//         },
//         { new: true }
//       );
  
//       if (!updateUser) {
//         return res.status(500).json({
//           success: false,
//           message: "Error in updating user",
//         });
//       }
  
//       res.status(200).send({
//         success: true,
//         message: "User updated successfully",
//         updateUser,
//       });
//     } catch (error) {
//       console.log(error);
//       res.status(500).send({
//         success: false,
//         message: "Error in updating user",
//         error,
//       });
//     }
//   };
  
//   // get photo
//   const userPhotoController = async (req, res) => {
//     try {
//       const user = await userModel
//         .findById(req.params.pid)
//         .select("authImage");
//       if (user.authImage.data) {
//         res.set("Content-type", user.authImage.contentType);
//         return res.status(201).send(user.authImage.data);
//       }
//     } catch (error) {
//       console.log(error);
//       res.status(500).send({
//         success: false,
//         message: "Erorr while getting photo",
//         error,
//       });
//     }
//   };

module.exports = {
  registerController,
  loginController,
};
  // module.exports = {
  //   registerController
  //   // getAllUser,
  //   // forgotPasswordController,
  //   // testController,
  //   // getSingleuser,
  //   // updateRegisterController,
  //   // userPhotoController
  //   // userProfileController,
  //   // getUserProfileController,
  //   // deleteUserProfileController,
  // };