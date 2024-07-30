import { Request, Response, NextFunction } from 'express';
import userModel from '../model/user';
const { hashPassword, comparePassword } = require("../helper/authHelper");
const JWT = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || 'hbkhvghvhvhgchfdxgfxfhmxxbnxvvbdfhxxcvb'; // Replace with your actual secret

// Register Controller
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

    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(200).send({
        success: false,
        message: "Already registered, please login",
      });
    }

    // Register new user
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

// Login Controller
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

    // Check if user exists
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

    // Generate token with 1-minute expiration
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
      JWT_SECRET,
      {
        expiresIn: "1m",
      }
    );

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

// Regenerate Token
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
    const durationThreshold = 1 * 60 * 1000; // 1 minute in milliseconds

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

// Get Single User
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

// Forgot Password Controller
const forgotPasswordController = async (req: Request, res: Response) => {
  try {
    const { answer, email, password } = req.body;
    if (!email) {
      return res.status(400).send({ message: "Email is required" });
    }
    if (!answer) {
      return res.status(400).send({ message: "Security answer is required" });
    }
    if (!password) {
      return res.status(400).send({ message: "New password is required" });
    }

    // Check user
    const user = await userModel.findOne({ email, answer });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Wrong email or security answer",
      });
    }

    const hashed = await hashPassword(password);
    await userModel.findByIdAndUpdate(user._id, { password: hashed });
    res.status(200).send({
      success: true,
      message: "Password reset successfully",
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

module.exports = {
  registerController,
  loginController,
  regenerateToken,
  getSingleuser,
  forgotPasswordController,
};
