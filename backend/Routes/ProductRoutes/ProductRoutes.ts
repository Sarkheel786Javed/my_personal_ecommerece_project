import express, { Request, Response } from "express";
import multer from "multer";
import ProductModel from "../../model/ProductModel/ProductModel";
import { addProduct, getProducts } from "../../controllers/ProductController/productController";

const router = express.Router();

// Set up multer to handle file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Route to add a product with images
router.post('/add-product', upload.array('images', 10), addProduct);

// Route to get products
router.get("/get-products", getProducts)

export default router;
