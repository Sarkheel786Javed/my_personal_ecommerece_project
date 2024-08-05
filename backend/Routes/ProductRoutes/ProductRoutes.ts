import express, { Request, Response } from "express";
import multer from "multer";
import ProductModel, {
  ProductDocument,
} from "../../model/ProductModel/ProductModel";
import path from "path";
import fs from "fs";
import { addProduct } from "../../controllers/ProductController/productController";

const router = express.Router();

// Use memory storage for multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Apply multer middleware to handle image uploads
router.post("/add-product", upload.array("images", 10), addProduct);

// Route to get products
router.get("/get-products", async (req: Request, res: Response) => {
  try {
    const products = await ProductModel.find();

    if (!products || products.length === 0) {
      return res.status(404).json({ error: "Products not found" });
    }
    res.json(products);
  } catch (error) {
    console.error("Error:", error); // Logging the error
    res
      .status(500)
      .json({ error: "An error occurred while fetching the products." });
  }
});

export default router;
