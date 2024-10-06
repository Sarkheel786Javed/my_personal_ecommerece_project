import { Request, Response } from "express";
import cloudinary from "../../config/cloudinaryConfig";
import Product from "../../model/ProductModel/ProductModel";
const categoryModel = require("../../model/ProductModel/ProductCategoryModel");
import userModel from '../../model/user';
import mongoose from "mongoose";
import { Readable } from "stream";



const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const isValidObjectId = (id: string): boolean => {
  return objectIdRegex.test(id);
};

export const addOrUpdateProduct = async (req: Request, res: Response) => {
  try {
    const imageFiles = req.files as Express.Multer.File[];

    // Upload images to Cloudinary
    const uploadPromises = imageFiles.map((file) => {
      return new Promise<string>((resolve, reject) => {
        const uploadStream = cloudinary.v2.uploader.upload_stream(
          { resource_type: "image" },
          (error, result) => {
            if (error) {
              console.error("Cloudinary upload error:", error);
              return reject(error);
            }
            if (result && result.secure_url) {
              resolve(result.secure_url);
            } else {
              reject(new Error("Upload result is missing secure_url"));
            }
          }
        );

        Readable.from(file.buffer).pipe(uploadStream);
      });
    });

    const imageUrls = await Promise.all(uploadPromises);

    const {
      _id,
      organizationName,
      organizationUserId,
      categoryId,
      ...otherData
    } = req.body;

    // Convert categoryId into an array and cast each ID to ObjectId
    let categoryIdsArray: mongoose.Types.ObjectId[] = [];
    try {
      categoryIdsArray = (
        Array.isArray(categoryId)
          ? categoryId
          : typeof categoryId === "string"
          ? categoryId.split(",")
          : []
      )
        .map((id) => id.trim())
        .filter((id) => isValidObjectId(id)) // Validate ID format
        .map((id) => new mongoose.Types.ObjectId(id));
    } catch (error) {
      console.error("Error converting categoryId to ObjectId:", error);
    }

    // Prepare product data
    const productData = {
      ...otherData,
      images: imageUrls,
      organizationName,
      organizationUserId,
      categoryId: categoryIdsArray, // Save categoryId as an array
    };

    if (_id && isValidObjectId(_id)) {
      // Update existing product
      const updatedProduct = await Product.findByIdAndUpdate(_id, productData, {
        new: true,
      });
      if (!updatedProduct) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.status(200).json({
        message: "Product updated successfully",
        product: updatedProduct,
      });
    } else {
      // Add new product
      const newProduct = new Product(productData);
      await newProduct.save();
      res.status(201).json({
        message: "Product added successfully",
        product: newProduct,
      });
    }
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Failed to add or update product.", err });
  }
};

// Function to get all products
export const getProducts = async (req: Request, res: Response) => {
  try {
    const search = (req.query.search as string) || "";
    const rating = (req.query.rating as string) || "0";
    const onSale = (req.query.onSale as string) || "0";
    const productName = (req.query.productName as string) || "";

    const query: any = {};

    if (search.trim() !== "") {
      query.$text = { $search: search };
    }

    const parsedRating = parseFloat(rating);
    if (!isNaN(parsedRating) && parsedRating > 0) {
      query.rating = { $gte: parsedRating };
    }

    if (onSale !== "0") {
      query.onSale = onSale === "true";
    }

    if (productName.trim() !== "") {
      query.productName = { $regex: new RegExp(productName, "i") };
    }

    const products = await Product.find(query);

    if (products.length === 0) {
      return res
        .status(404)
        .json({ error: "No products found matching the criteria." });
    }

    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the products." });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

    // Validate productId
    if (!productId || !isValidObjectId(productId)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    // Find and delete the product
    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json({
      message: "Product deleted successfully",
      // product: deletedProduct, // Optional: return the deleted product if needed
    });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ error: "Failed to delete product", err });
  }
};
