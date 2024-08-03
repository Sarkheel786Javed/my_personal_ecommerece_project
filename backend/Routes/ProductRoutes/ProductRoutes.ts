import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { addProduct } from '../../controllers/ProductController/productController';
import Product from '../../model/ProductModel/ProductModel';

const router = express.Router();

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/'); // Specify the directory where you want to save uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use the original name of the file as its name on disk
  },
});
const upload = multer({ storage: storage });

// Endpoint to upload images
router.post('/upload-images', upload.array('images', 10), (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
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

// Endpoint to add a product
router.post('/add-product', async (req: Request, res: Response) => {
  try {
    const newProduct = new Product(req.body); // Assuming ProductModel accepts req.body as input
    await newProduct.save();
    res.status(201).json(newProduct); // Return the newly created product
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add product.' });
  }
});

// Endpoint to get a product by ID
router.get('/get-product/:id', async (req: Request, res: Response) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product); // Return the product with imageUrls
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching the product.' });
  }
});

export default router;
