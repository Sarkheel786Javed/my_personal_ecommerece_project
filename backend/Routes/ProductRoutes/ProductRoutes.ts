// Routes/ProductRoutes/ProductRoutes.ts

import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import {addProduct} from '../../controllers/ProductController/productController';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/upload-images', upload.array('images', 10), (req: Request, res: Response, next: NextFunction) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files) {
      return res.status(400).send('No files were uploaded.');
    }

    // Example: Process files
    files.forEach((file) => {
      console.log(`Received file: ${file.originalname}, size: ${file.size}`);
    });

    res.send(`Successfully received ${files.length} files!`);
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while uploading files.');
  }
});

router.post('/add-product', addProduct);

export default router;
