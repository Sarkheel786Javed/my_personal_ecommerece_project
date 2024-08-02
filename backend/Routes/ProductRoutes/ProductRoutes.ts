import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const { addProduct } = require ('../../controllers/ProductController/productController')

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../public/images');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

router.post('/upload-images', upload.array('images'), (req: Request, res: Response) => {
  const imagePaths = (req.files as Express.Multer.File[]).map((file) => ({
    name: file.originalname,
    path: `/images/${file.filename}`
  }));
  res.json({ imagePaths });
});

router.post('/add-product', addProduct);

export default router;
