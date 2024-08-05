import mongoose, { Document } from 'mongoose';

export interface ProductDocument extends Document {
  category: string;
  discountType: string;
  discount: String;
  stock: String;
  price: String;
  gender: string;
  size: string;
  description: string;
  productName: string;
  images: Buffer[];
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
    images: { type: [Buffer], required: true }, // Change to Buffer
  },
  { timestamps: true }
);

const Product = mongoose.model<ProductDocument>('Product', ProductSchema);
export default Product;
