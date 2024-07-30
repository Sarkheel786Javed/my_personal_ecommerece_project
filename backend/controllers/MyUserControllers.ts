import { Request, Response, NextFunction } from 'express';
import userModel from '../model/user';
const { hashPassword, comparePassword } = require("../helper/authHelper");
const JWT = require("jsonwebtoken");

const registerController = async (req: Request, res: Response) => {
  try {
    console.log('Request received:', req.body);
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
        expiresIn: "1m",
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

export default loginController;

const regenerateToken = async (req: Request, res: Response) => {
  try {
    const token = req.params.token;
    if (!token) {
      return res.status(400).send({
        success: false,
        message: "Token is required",
      });
    }

    // Verify the token
    let decoded;
    try {
      decoded = JWT.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
    } catch (error) {
      return res.status(401).send({
        success: false,
        message: "Invalid token",
      });
    }

    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) {
      return res.status(400).send({
        success: false,
        message: "Token is expired",
      });
    }

    // Calculate the difference between updatedAt and the current date and time
    const updatedAt = new Date(decoded.updatedAt).getTime();
    const currentTime = Date.now();
    const durationInMilliseconds = currentTime - updatedAt;

    // Set your desired duration threshold (e.g., 5 minutes)
    const durationThreshold = 1 * 60 * 1000; // 5 minutes in milliseconds

    // Check if the duration is greater than the threshold
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
        process.env.JWT_SECRET,
        {
          expiresIn: "1m",
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
    const token = req.params.token; // Access token from request parameters

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const decodedToken = JWT.verify(token, process.env.JWT_SECRET) as { userId: string, iat: number, exp: number };

    // Check if the token's issued time is within the valid duration
    const currentTime = Date.now();
    const issuedAt = decodedToken.iat * 1000; // Convert to milliseconds
    const durationInMinutes = (currentTime - issuedAt) / 60000; // Convert milliseconds to minutes

    if (durationInMinutes > 1) {
      return res.status(401).json({
        success: false,
        message: "Token expired or invalid",
      });
    }

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
      user: { user: user },
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
  regenerateToken
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