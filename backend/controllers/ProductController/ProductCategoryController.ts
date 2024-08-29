import express, { Request, Response } from "express";
const categoryModel = require ("../../model/ProductModel/ProductCategoryModel")
import userModel from "../../model/user";

const router = express.Router();

export const createCategoryController = async (req: Request, res: Response) => {
  try {
    const { categoryName, userId } = req.body;

    // Validate input
    if (!categoryName || !userId) {
      return res.status(400).send({ message: "Category name and User ID are required" });
    }

    // Find user by userId
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Check if the category already exists for the user or organization
    const existingCategory = await categoryModel.findOne({ categoryName, userId });
    if (existingCategory) {
      return res.status(409).send({
        success: false,
        message: "Category already exists for this user/organization",
      });
    }

    // Create new category
    const category = await new categoryModel({
      categoryName,
      userId,
      organization: user.Organization, // Associate the category with the user's organization
    }).save();

    res.status(201).send({
      success: true,
      message: "New category created",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in Category creation",
    });
  }
};

export const getCategoryController = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query; // Use query parameter to optionally pass userId

    let categories;

    if (userId) {
      // If userId is provided, filter categories by userId
      categories = await categoryModel.find({ userId });
    } else {
      // If no userId is provided, retrieve all categories
      categories = await categoryModel.find();
    }

    if (categories.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No categories found",
      });
    }

    res.status(200).send({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).send({
      success: false,
      error,
      message: "Error fetching categories",
    });
  }
};

