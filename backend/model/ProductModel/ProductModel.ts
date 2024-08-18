// model/ProductModel/ProductModel.ts
import mongoose, { Document } from 'mongoose';

export interface ProductDocument extends Document {
  category: string;
  discountType: string;
  discount: string;
  stock: string;
  price: string;
  gender: string;
  size: string;
  description: string;
  productName: string;
  images: string[];
  rating: number; // Add rating field
  onSale: boolean; // Add onSale field
}

const ProductSchema = new mongoose.Schema(
  {
    productName: { type: String, required: true },
    category: { type: String, required: true },
    discountType: { type: String, required: true },
    discount: { type: String, required: true },
    stock: { type: String, required: true },
    price: { type: String, required: true },
    gender: { type: String, required: true },
    size: { type: String, required: true },
    description: { type: String, required: true },
    images: { type: [String], required: true },
    rating: { type: Number, required: true }, // Add rating field
    onSale: { type: Boolean, required: true }, // Add onSale field
  },
  { timestamps: true }
);

// Create a text index on fields you want to search
ProductSchema.index({ productName: 'text', description: 'text' });

const Product = mongoose.model<ProductDocument>('Product', ProductSchema);
export default Product;
