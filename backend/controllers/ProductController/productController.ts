import { Request, Response } from 'express';
import Product from '../../model/ProductModel/ProductModel';

 export const addProduct = async (req: Request, res: Response) => {
  try {
    const newProduct = new Product(req.body); // Assuming ProductModel accepts req.body as input
    await newProduct.save();
    res.status(201).json(newProduct); // Return the newly created product
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add product." });
  }
};
// module.exports = {
//   addProduct,
  
// };