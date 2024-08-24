import express, { Request, Response } from "express";
import multer from "multer";
import { addOrUpdateProduct, getProducts } from "../../controllers/ProductController/productController";

const router = express.Router();

// Set up multer to handle file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Route to add a product with images
router.post('/add-product', upload.array('images', 10), addOrUpdateProduct);

// Route to get products
router.get("/get-products", getProducts)

export default router;
