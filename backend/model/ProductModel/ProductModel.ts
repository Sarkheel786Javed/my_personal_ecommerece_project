// model/ProductModel/ProductModel.ts
import mongoose, { Document } from "mongoose";

export interface ProductDocument extends Document {
  userId: string,
  discountType: string;
  discount: string;
  stock: string;
  price: string;
  gender: string;
  size: string;
  description: string;
  productName: string;
  images: string[];
  rating: number;
  onSale: boolean;
  featured: boolean;
  organizationName: string; 
  organizationUserId: mongoose.Schema.Types.ObjectId;
  categoryId: mongoose.Schema.Types.ObjectId;
}

const ProductSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    productName: { type: String, required: true },
    discountType: { type: String, required: true },
    discount: { type: String, required: true },
    stock: { type: String, required: true },
    price: { type: String, required: true },
    gender: { type: String, required: true },
    size: { type: String, required: true },
    description: { type: String, required: true },
    images: { type: [String], required: true },
    onSale: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    organizationName: { type: String, required: true },
    organizationUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    categoryId: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
  },
  { timestamps: true }
);

ProductSchema.index({ productName: "text", description: "text" });

const Product = mongoose.model<ProductDocument>("Product", ProductSchema);
export default Product;
