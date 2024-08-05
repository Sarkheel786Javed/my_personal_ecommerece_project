import { Request, Response } from 'express';
import Product from '../../model/ProductModel/ProductModel';

export const addProduct = async (req: Request, res: Response) => {
  try {
    // Convert uploaded files to binary buffers
    const images = req.files
      ? (req.files as Express.Multer.File[]).map((file) => file.buffer)
      : [];

    // Create a new product with image data
    const productData = {
      ...req.body,
      images,
    };

    const newProduct = new Product(productData);
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add product." });
  }
};
// module.exports = {
//   addProduct,
  
// };