import express, { Request, Response } from "express";
const categoryModel = require("../../model/ProductModel/ProductCategoryModel")
import userModel from "../../model/user";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const isValidObjectId = (id: string): boolean => {
  return objectIdRegex.test(id);
};

export const createCategoryController = async (req: Request, res: Response) => {
  try {
    const { categoryId, categoryName, userId } = req.body;

    // Validate input
    if (!categoryName || !userId) {
      return res.status(400).send({ message: "Category name and User ID are required" });
    }

    // Find user by userId
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    if (categoryId > "0") {
      // If categoryId is provided, update the existing category
      const category = await categoryModel.findById(categoryId);

      if (!category) {
        return res.status(404).send({ message: "Category not found" });
      }

      // Check if the category name is already used by the user or organization
      const existingCategory = await categoryModel.findOne({
        categoryName,
        userId,
        _id: { $ne: categoryId }, // Exclude current category from the check
      });
      if (existingCategory) {
        return res.status(409).send({
          success: false,
          message: "Category name already exists for this organization",
        });
      }

      // Update the category
      category.categoryName = categoryName;
      await category.save();

      return res.status(200).send({
        success: true,
        message: "Category updated successfully",
        category, // Optionally return the updated category
      });

    } else {
      // If no categoryId, create a new category
      // Check if the category already exists for the user or organization
      const existingCategory = await categoryModel.findOne({ categoryName, userId });
      if (existingCategory) {
        return res.status(409).send({
          success: false,
          message: "Category already exists for this organization",
        });
      }

      // Create new category
      const category = await new categoryModel({
        categoryName,
        userId,
        organization: user.Organization, // Associate the category with the user's organization
      }).save();

      return res.status(201).send({
        success: true,
        message: "New category created",
        category, // Optionally return the new category
      });
    }

  } catch (error) {
    console.error("Error in Category operation:", error);
    res.status(500).send({
      success: false,
      error: error,
      message: "Error in Category operation",
    });
  }
};

export const getCategoryController = async (req: Request, res: Response) => {
  try {
    const { userId, searchString } = req.query;

    let categories;

    const query: any = {};
    if (userId) {
      query.userId = userId;
    }

    if (searchString) {
      query.categoryName = { $regex: searchString, $options: 'i' };
    }

    categories = await categoryModel.find(query).sort({ createdAt: -1 });

    if (categories.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No categories found",
      });
    }

    res.json(categories)
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).send({
      success: false,
      error,
      message: "Error fetching categories",
    });
  }
};

export const deleteProductCategory = async (req: Request, res: Response) => {
  try {
    const { productCategoryId } = req.params;

    if (!productCategoryId || !isValidObjectId(productCategoryId)) {
      return res.status(400).json({
        response: false,
        error: "Invalid Category ID"
      });
    }

    const deletedProduct = await categoryModel.findByIdAndDelete(productCategoryId);

    if (!deletedProduct) {
      return res.status(404).json({
        response: false,
        error: "Product Category not found"
      });
    }

    res.status(200).json({
      response: true,
      message: "Category deleted successfully",

    });
  } catch (err) {
    console.error("Error deleting product category:", err);
    res.status(500).json({
      response: false,
      error: "Failed to delete product category", err
    });
  }
};




