import { Request, Response, NextFunction } from 'express';
import ProductModel from '../../model/ProductModel/ProductModel'

const addProduct = async (req: Request, res: Response) => {
    const productData = req.body;
    try {
      const newProduct = new ProductModel(productData);
      await newProduct.save();
      res.status(201).json({ message: 'Product added successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error adding product', error });
    }
  };
module.exports = {
    addProduct,
    
};
