import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./dbconfig/db";
import myUserRoute from "./Routes/Auth";
import Product from "./Routes/ProductRoutes/ProductRoutes";
import ProductCategoryRoutes from './Routes/ProductRoutes/ProductCategoryRoutes';
import RequestDepartment from './Routes/UserRequestDepartmentRoutes/UserRequestDepartmentRoutes';
connectDB();
const app = express();
app.use(express.json());
app.use(cors());
// for product files 
app.use(express.static('public')); // Serve static files from 'public' folder


app.use("/api/user", myUserRoute);
app.use(express.static("public"));
/////////////////////////////////////
app.use("/api/product/category", ProductCategoryRoutes);
app.use("/api/product", Product);
////////////////////////////////////
app.use("/api/departmentrequest", RequestDepartment);
////////////////////////////////////

app.get("/test", async (req: Request, res: Response) => {
  res.json({ message: "Hello!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server Started on localhost:7000");
});
