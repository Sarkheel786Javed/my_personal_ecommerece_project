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
  images: string[]; // Update to string array
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
    images: { type: [String], required: true }, // Change to String array
  },
  { timestamps: true }
);

const Product = mongoose.model<ProductDocument>('Product', ProductSchema);
export default Product;
