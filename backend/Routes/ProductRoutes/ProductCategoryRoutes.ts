import express, { Request, Response } from "express";
import multer from "multer";
import { createCategoryController ,getCategoryController,deleteProductCategory } from "../../controllers/ProductController/ProductCategoryController";

const router = express.Router();

// Set up multer to handle file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Route to add a product with images
router.post('/add-category', createCategoryController);
router.get('/get-category', getCategoryController);
router.delete('/delete-category/:productCategoryId',deleteProductCategory );

export default router;
