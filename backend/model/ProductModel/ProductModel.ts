import mongoose from "mongoose";


export interface ProductDocument extends Document {
  toObject(): any;
  category: string;
  discountType: string;
  discount: number;
  stock: number;
  price: number;
  gender: string;
  size: string;
  description: string;
  productName: string;
  imageUrls: string[];
}

const ProductSchema = new mongoose.Schema(
  {
      category: { type: String, required: true },
      discountType: { type: String, required: true },
      discount: { type: Number, required: true },
      stock: { type: Number, required: true },
      price: { type: Number, required: true },
      gender: { type: String, required: true },
      size: { type: String, required: true },
      description: { type: String, required: true },
      productName: { type: String, required: true },
      imageUrls: { type: [String], required: true },
  },
  { timestamps: true }
);

const Product = mongoose.model<ProductDocument>("Product", ProductSchema);
export default Product;