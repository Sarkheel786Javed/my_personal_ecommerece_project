import express, { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const {
  addProduct,
} = require("../../controllers/ProductController/productController");

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads"); // Destination folder where files will be stored
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // File name customization
  },
});

// Initialize multer upload middleware
const upload = multer({ storage: storage });

// Route to handle file upload
router.post("/upload-images", upload.array("images", 10), (req, res) => {
  console.log(req.files);

  res.send("Files uploaded successfully.");
});

router.post("/add-product", addProduct);

export default router;
