import { Request, Response, NextFunction } from 'express';
import userModel from '../model/user';
const { hashPassword, comparePassword } = require("../helper/authHelper");
const JWT = require("jsonwebtoken");

const registerController = async (req: Request, res: Response) => {
  try {
    const { userName, email, password, addressLine1, city, country, answer, phoneNumbber } = req.body;

    // Validations
    if (!userName) return res.status(400).send({ error: "User name is required" });
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
      userName,
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
const loginController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(404).send({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check user
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Email is not registered",
      });
    }

    // Compare password
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(200).send({
        success: false,
        message: "Invalid Password",
      });
    }

    // Update login time
    user.updatedAt = new Date();
    await user.save();

    // Generate token with 5-minute expiration
    const token = JWT.sign(
      {
        _id: user._id,
        userName: user.userName,
        email: user.email,
        addressLine1: user.addressLine1,
        phoneNumbber: user.phoneNumbber,
        city: user.city,
        country: user.country,
        answer: user.answer,
        Organization: user.Organization,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "60m",
      }
    );

    // Send response
    res.status(200).send({
      success: true,
      message: "Login successfully",
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

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

// Check if the provided user ID is valid
const isValidObjectId = (id: string): boolean => {
  return objectIdRegex.test(id);
};

// Controller to update user departments
const updateUserDepartmentsController = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Check if the userId is provided and valid
    if (!userId || !isValidObjectId(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    // Find the user by userId
    const user = await userModel.findById(userId);
    if (user) {
      // Update the user's organization
      user.Organization = "Department"; 
      await user.save(); // Save the changes
      console.log(`User with ID ${userId} updated successfully.`);
      return res.status(200).json({ success: true, message: "User's organization updated to 'Department' successfully" });
    } else {
      console.log(`User with ID ${userId} not found.`);
      return res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    console.error("Error updating user's organization:", error);
    return res.status(500).json({ success: false, message: "Error updating organization", error });
  }
};

const regenerateToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).send({
        success: false,
        message: "Token is required",
      });
    }

    // Verify the token without checking expiration
    let decoded;
    try {
      decoded = JWT.verify(token, JWT_SECRET, { ignoreExpiration: true });
    } catch (error) {
      return res.status(401).send({
        success: false,
        message: "Invalid token",
      });
    }

    // Calculate the difference between updatedAt and the current date and time
    const updatedAt = new Date(decoded.updatedAt).getTime();
    const currentTime = Date.now();
    const durationInMilliseconds = currentTime - updatedAt;

    // Set duration threshold (1 minute)
    const durationThreshold = 60 * 60 * 1000; // 1 minute in milliseconds

    if (durationInMilliseconds > durationThreshold) {
      // Issue a new token
      const newToken = JWT.sign(
        {
          _id: decoded._id,
          userName: decoded.userName,
          email: decoded.email,
          addressLine1: decoded.addressLine1,
          phoneNumbber: decoded.phoneNumbber,
          city: decoded.city,
          country: decoded.country,
          answer: decoded.answer,
          Organization: decoded.Organization,
          createdAt: decoded.createdAt,
          updatedAt: new Date().toISOString(),
        },
        JWT_SECRET,
        {
          expiresIn: "60m",
        }
      );

      return res.status(200).send({
        success: true,
        message: "Token regenerated successfully",
        token: newToken,
      });
    } else {
      return res.status(400).send({
        success: false,
        message: "Token refresh not required yet",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in regenerating token",
      error,
    });
  }
};

const getSingleuser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const decodedToken = JWT.verify(token, JWT_SECRET) as { _id: string, iat: number, exp: number };

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Get user data successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to get user data",
      error: (error as Error).message,
    });
  }
};

// Get users where Organization is 'department'
const getUsersByDepartment = async (req: Request, res: Response) => {
  try {
    const organization = req.params.organization;

    const departmentUsers = await userModel
      .find({ Organization: { $regex: new RegExp(`^${organization}$`, 'i') } })
      .sort({ createdAt: -1 });

    if (!departmentUsers.length) {
      return res.status(404).json({
        success: false,
        message: "No users found in the department.",
      });
    }

    res.json(departmentUsers);
  } catch (error) {
    console.error("Error in getUsersByDepartment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve users",
      error: error,
    });
  }
};

//forgotPasswordController

const forgotPasswordController = async (req: Request, res: Response) => {
  try {
    const { answer, email, password } = req.body;
    if (!email) {
      res.status(400).send({ message: "email is required" });
    }
    if (!answer) {
      res.status(400).send({ message: "Father Name  is required" });
    }
    if (!password) {
      res.status(400).send({ message: "New Password is required" });
    }

    //check
    const user = await userModel.findOne({ email, answer });
    //validation
    const F_name = answer;
    if (F_name !== answer) {
      return res.status(404).send({
        success: false,
        message: "Father Name is not same ",
      });
    }
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Wrong Email Or FatherName",
      });
    }
    const hashed = await hashPassword(password);
    await userModel.findByIdAndUpdate(user._id, { password: hashed });
    res.status(200).send({
      success: true,
      message: "Password Reset Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};
const JWT_SECRET = process.env.JWT_SECRET || 'hbkhvghvhvhgchfdxgfxfhmxxbnxvvbdfhxxcvb'; // Replace with your actual secret

// Get Single User


// Forgot Password Controller

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
  forgotPasswordController,
  getSingleuser,
  regenerateToken,
  getUsersByDepartment,
  updateUserDepartmentsController
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