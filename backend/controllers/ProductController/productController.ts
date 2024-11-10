import { Request, response, Response } from "express";
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

    // Upload new images to Cloudinary if any new files are provided
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

    const newImageUrls = await Promise.all(uploadPromises);

    const {
      _id,
      organizationName,
      organizationUserId,
      categoryId,
      existingImageUrls = [], // Get existing image URLs from the request
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

    // Combine existing image URLs with new uploaded image URLs
    const allImageUrls = [
      ...(Array.isArray(existingImageUrls) ? existingImageUrls : [existingImageUrls]),
      ...newImageUrls,
    ];

    // Prepare product data
    const productData = {
      ...otherData,
      images: allImageUrls, // Set both existing and new URLs
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
        return res.status(404).json({
          response: false,
          error: "Product not found",
        });
      }
      res.status(200).json({
        message: "Product updated successfully",
        response: true,
        // product: updatedProduct,
      });
    } else {
      // Add new product
      const newProduct = new Product(productData);
      await newProduct.save();
      res.status(201).json({
        response: true,
        message: "Product added successfully",
        // product: newProduct,
      });
    }
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Failed to add or update product.", err });
  }
};


export const getProducts = async (req: Request, res: Response) => {
  try {
    const featured = (req.query.featured as string) || "0";
    const rating = (req.query.rating as string) || "0";
    const onSale = (req.query.onSale as string) || "0";
    const productName = (req.query.productName as string) || "";
    const organizationUserId = req.query.organizationUserId as string;
    const page = parseInt(req.query.page as string);
    const pageSize = parseInt(req.query.pageSize as string);
    const query: any = {};

    if (organizationUserId && isValidObjectId(organizationUserId)) {
      query.organizationUserId = organizationUserId;
      if (productName.trim() !== "") {
        query.productName = { $regex: new RegExp(productName, "i") };
      }
  
      const parsedRating = parseFloat(rating);
      if (!isNaN(parsedRating) && parsedRating > 0) {
        query.rating = { $gte: parsedRating };
      }
  
      if (onSale === "true" && featured === "true") {
        query.$and = [{ onSale: true }, { featured: true }];
      } else {
        if (onSale === "true") {
          query.onSale = true;
        }
        else if (featured === "true") {
          query.featured = true;
        }
      }
    }else{
      if (productName.trim() !== "") {
        query.productName = { $regex: new RegExp(productName, "i") };
      }
  
      const parsedRating = parseFloat(rating);
      if (!isNaN(parsedRating) && parsedRating > 0) {
        query.rating = { $gte: parsedRating };
      }
  
      if (onSale === "true" && featured === "true") {
        query.$and = [{ onSale: true }, { featured: true }];
      } else {
        if (onSale === "true") {
          query.onSale = true;
        }
        else if (featured === "true") {
          query.featured = true;
        }
      }
    }

   
    const skip = (page - 1) * pageSize;
    const products = await Product.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(pageSize);

    if (products.length === 0) {
      return res.status(404).json({
        response: false,
        error: "No products found matching the criteria.",
      });
    }

    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      response: false,
      error: "An error occurred while fetching the products.",
    });
  }
};


export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

    // Validate productId
    if (!productId || !isValidObjectId(productId)) {
      return res.status(400).json({
        response: false,
        error: "Invalid product ID"
      });
    }

    // Find and delete the product
    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return res.status(404).json({
        response: false,
        error: "Product not found"
      });
    }

    res.status(200).json({
      response: true,
      message: "Product deleted successfully",
      // product: deletedProduct, // Optional: return the deleted product if needed
    });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({
      response: false,
      error: "Failed to delete product", err
    });
  }
};
