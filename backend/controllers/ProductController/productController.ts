import { Request, Response } from 'express';
import cloudinary from '../../config/cloudinaryConfig'; // Adjust the path as necessary
import Product from '../../model/ProductModel/ProductModel';
import { Readable } from 'stream';

export const addProduct = async (req: Request, res: Response) => {
  try {
    // Convert uploaded files to readable streams
    const imageFiles = req.files as Express.Multer.File[];

    const uploadPromises = imageFiles.map(file => {
      return new Promise<string>((resolve, reject) => {
        const uploadStream = cloudinary.v2.uploader.upload_stream(
          { resource_type: 'image' },
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              return reject(error);
            }
            if (result && result.secure_url) {
              resolve(result.secure_url);
            } else {
              reject(new Error('Upload result is missing secure_url'));
            }
          }
        );

        Readable.from(file.buffer).pipe(uploadStream);
      });
    });

    const imageUrls = await Promise.all(uploadPromises);

    // Create a new product with image data
    const productData = {
      ...req.body,
      images: imageUrls, // Save Cloudinary URLs
    };

    const newProduct = new Product(productData);
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: "Failed to add product." });
  }
};
export const getProduct = async (req: Request, res: Response) => {
  try {
    const products = await Product.find();

    if (!products || products.length === 0) {
      return res.status(404).json({ error: "Products not found" });
    }
    res.json(products);
  } catch (error) {
    console.error("Error:", error); // Logging the error
    res
      .status(500)
      .json({ error: "An error occurred while fetching the products." });
  }
}