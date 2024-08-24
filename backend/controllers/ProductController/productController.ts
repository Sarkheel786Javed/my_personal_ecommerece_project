import { Request, Response } from "express";
import cloudinary from "../../config/cloudinaryConfig"; // Adjust the path as necessary
import Product from "../../model/ProductModel/ProductModel";
import { Readable } from "stream";

// Regular expression to validate MongoDB ObjectId
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
    // Prepare product data
    const productData = {
      ...req.body,
      images: imageUrls,
    };

    const productId = req.body._id;

    if (productId && isValidObjectId(productId)) {
      // Update existing product
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        productData,
        { new: true }
      );
      if (!updatedProduct) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.status(200).json({
        message: "Product updated successfully",
        // product: updatedProduct,
      });
    } else {
      // Add new product
      const newProduct = new Product(productData);
      await newProduct.save();
      res.status(201).json({
        message: "Product added successfully",
        // product: newProduct,
      });
    }
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Failed to add or update product.",err});
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