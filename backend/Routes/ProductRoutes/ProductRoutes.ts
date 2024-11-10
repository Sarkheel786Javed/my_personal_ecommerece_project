import express, { Request, Response } from "express";
import multer from "multer";
import { addOrUpdateProduct, getProducts, deleteProduct } from "../../controllers/ProductController/productController";
const {requireSignIn} = require  ('../../middleware/authMiddleware')
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/add-product', upload.array('images', 6), requireSignIn, addOrUpdateProduct);

router.get("/get-products", requireSignIn, getProducts)

router.delete('/delete-product/:productId', requireSignIn, deleteProduct);

export default router;
