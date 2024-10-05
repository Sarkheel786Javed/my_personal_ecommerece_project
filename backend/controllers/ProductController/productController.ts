import { Request, Response } from "express";
import cloudinary from "../../config/cloudinaryConfig";
import Product from "../../model/ProductModel/ProductModel";
const categoryModel = require("../../model/ProductModel/ProductCategoryModel");
import userModel from '../../model/user';
const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const isValidObjectId = (id: string): boolean => {
  return objectIdRegex.test(id);
};
export const createOrUpdateProductController = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      _id,
      productName,
      discountType,
      discount,
      stock,
      price,
      gender,
      size,
      description,
      rating,
      onSale,
      featured,
      organizationName,
      organizationUserId,
      categoryId,
      images,
    } = req.body;

    // Validations
    if (!productName || typeof productName !== "string") {
      return res
        .status(400)
        .json({ message: "Invalid or missing product name" });
    }

    if (!discountType || typeof discountType !== "string") {
      return res
        .status(400)
        .json({ message: "Invalid or missing discount type" });
    }

    if (!discount || isNaN(Number(discount))) {
      return res.status(400).json({ message: "Invalid or missing discount" });
    }

    if (!stock || isNaN(Number(stock))) {
      return res.status(400).json({ message: "Invalid or missing stock" });
    }

    if (!price || isNaN(Number(price))) {
      return res.status(400).json({ message: "Invalid or missing price" });
    }

    if (!gender || typeof gender !== "string") {
      return res.status(400).json({ message: "Invalid or missing gender" });
    }

    if (!size || typeof size !== "string") {
      return res.status(400).json({ message: "Invalid or missing size" });
    }

    if (!description || typeof description !== "string") {
      return res
        .status(400)
        .json({ message: "Invalid or missing description" });
    }

    // if (rating !== undefined && isNaN(Number(rating))) {
    //   return res.status(400).json({ message: "Invalid rating" });
    // }

    // if (onSale !== undefined && typeof onSale !== "boolean") {
    //   return res.status(400).json({ message: "Invalid onSale value" });
    // }

    // if (featured !== undefined && typeof featured !== "boolean") {
    //   return res.status(400).json({ message: "Invalid featured value" });
    // }

    if (!organizationName || typeof organizationName !== "string") {
      return res
        .status(400)
        .json({ message: "Invalid or missing organization name" });
    }

    if (!organizationUserId || !organizationUserId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid organization user ID" });
    }

    if (
      !Array.isArray(categoryId) ||
      categoryId.length === 0 ||
      !categoryId.every(
        (id: any) => typeof id === "string" && id.match(/^[0-9a-fA-F]{24}$/)
      )
    ) {
      return res
        .status(400)
        .json({ message: "Invalid or missing category IDs" });
    }

    if (images && !Array.isArray(images)) {
      return res.status(400).json({ message: "Images should be an array" });
    }

    // Validate user
    const user = await userModel.findById(organizationUserId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate category IDs
    const validCategoryIds = await categoryModel.find({
      _id: { $in: categoryId },
    });
    if (validCategoryIds.length !== categoryId.length) {
      return res
        .status(400)
        .json({ message: "One or more category IDs are invalid" });
    }

    // Handle images upload
    const imageUrls: string[] = [];
    if (images && images.length > 0) {
      for (const image of images) {
        const result = await cloudinary.v2.uploader.upload(image, {
          folder: "products",
        });
        imageUrls.push(result.secure_url);
      }
    }

    // Prepare product data
    const productData = {
      productName,
      discountType,
      discount,
      stock,
      price,
      gender,
      size,
      description,
      rating,
      onSale,
      featured,
      organizationName,
      organizationUserId,
      categoryId,
      images: imageUrls,
    };

    // Create or update product
    let product;
    if (_id) {
      product = await Product.findByIdAndUpdate(_id, productData, {
        new: true,
      });
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
    } else {
      product = await new Product(productData).save();
    }

    res.status(201).json({
      success: true,
      message: _id
        ? "Product updated successfully"
        : "Product created successfully",
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error,
      message: "Error in Product creation/updation",
    });
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
