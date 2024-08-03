import express from "express";
import multer from "multer";
import { Request, Response } from "express"; 
import path from "path";
import fs from "fs";
const {
  addProduct,
} = require("../../controllers/ProductController/productController");

const router = express.Router();

// Multer storage configuration
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
router.post("/upload-images", upload.array("images", 10), (req: Request, res: Response) => {
  // Log uploaded files information
  console.log(req.files);

  // Assuming you want to pass these files to addProduct controller
  const { body, files } = req; // Extracting body and files from request

  // Example: pass files and other data to addProduct controller
  addProduct(body, files)
    .then((result: any) => {
      res.send(result); // Send response from controller
    })
    .catch((error: Error) => {
      console.error("Error adding product:", error);
      res.status(500).send("Error adding product"); // Handle error response
    });
});

export default router;
