import express, { Request, Response } from "express";
import multer from "multer";
import { addOrUpdateProduct, getProducts, deleteProduct } from "../../controllers/ProductController/productController";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/add-product', upload.array('images', 6), addOrUpdateProduct);

router.get("/get-products", getProducts)

router.delete('/delete-product/:productId', deleteProduct); 

export default router;
