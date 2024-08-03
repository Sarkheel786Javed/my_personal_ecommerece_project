import { Request, Response } from 'express';
import Product from '../../model/ProductModel/ProductModel';

 export const addProduct = async (req: Request, res: Response) => {
  const productData = req.body;
  try {
    const newProduct = new Product(productData);
    await newProduct.save();
    res.status(201).json({ message: 'Product added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding product', error });
  }
};
// module.exports = {
//   addProduct,
  
// };