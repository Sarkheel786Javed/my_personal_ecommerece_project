import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    productName: { type: String, required: true },
    description: { type: String, required: true },
    size: { type: String, required: true },
    gender: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    discount: { type: Number, required: true },
    discountType: { type: String, required: true },
    category: { type: String, required: true },
    imageUrls: [{ name: String, path: String }],
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", ProductSchema);
export default Product;
