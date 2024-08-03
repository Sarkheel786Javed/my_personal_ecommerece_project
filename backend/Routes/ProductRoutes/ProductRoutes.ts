import express, { Request, Response } from "express";
import multer from "multer";
import ProductModel from "../../model/ProductModel/ProductModel";
import { addProduct } from "../../controllers/ProductController/productController";
import path from "path";

const router = express.Router();

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/"); // Specify the directory where you want to save uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname)); // Use the original name of the file as its name on disk
  },
});
const upload = multer({ 
  storage: storage  
});

// Route to upload images and create a new product
router.post("/upload-images", upload.array("images", 10), async (req: Request, res: Response) => {
  try {
    // Extract image URLs from req.files
    const imageUrls = (req.files as Express.Multer.File[]).map(file => file.path);

    // Ensure required fields are present before saving
    const productData = {
      imageUrls,
      category: req.body.category,
      discountType: req.body.discountType,
      discount: req.body.discount,
      stock: req.body.stock,
      price: req.body.price,
      gender: req.body.gender,
      size: req.body.size,
      description: req.body.description, 
      productName: req.body.productName,
    };

    const newProduct = new ProductModel(productData);
    const savedProduct = await newProduct.save();

    res.json(savedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while uploading images and creating the product." });
  }
});

// Route to add a new product
router.post("/add-product", addProduct);

// Route to get products
router.get("/get-products", async (req: Request, res: Response) => {
  try {
    const products = await ProductModel.find();

    if (!products || products.length === 0) {
      return res.status(404).json({ error: "Products not found" });
    }

    res.json(products); // Return the products with imageUrls
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching the products." });
  }
});

export default router;
