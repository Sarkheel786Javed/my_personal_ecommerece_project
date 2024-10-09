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
    const { organization, searchString, page , pageSize } = req.query;
    const pageNum = parseInt(page as string);
    const size = parseInt(pageSize as string);
    let categories;

    const query: any = {}; // Create query object

    // Build the query based on organization and searchString
    if (organization === 'department') {
      query.organization = 'department';
    } else if (organization === 'user') {
      query.organization = 'user';
    }

    if (searchString) {
      query.name = { $regex: searchString, $options: 'i' }; // Add regex filter for name
    }

    // Fetch the total number of categories that match the query
    const totalCategories = await categoryModel.countDocuments(query);

    // Apply pagination using skip and limit
    categories = await categoryModel
      .find(query)
      .skip(pageNum * size)
      .limit(size);

    if (categories.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No categories found",
      });
    }

    // Add totalCategories and totalPages to each category object but return only specific fields
    const categoriesWithPaginationInfo = categories.map((category:any) => ({
      _id: category._id,
      categoryName: category.categoryName,
      organization: category.organization,
      totalCategories: totalCategories,
      totalPages: Math.ceil(totalCategories / size),
    }));

    // Return the paginated response with required fields only
    res.json(categoriesWithPaginationInfo)
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).send({
      success: false,
      error,
      message: "Error fetching categories",
    });
  }
};




