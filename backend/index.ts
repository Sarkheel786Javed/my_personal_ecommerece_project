import express, { Request, Response } from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './dbconfig/db';
import myUserRoute from './Routes/Auth';
import Product from './Routes/ProductRoutes/ProductRoutes';


connectDB();
const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/user", myUserRoute);
app.use("/api/product", Product);

app.get("/test", async (req: Request, res: Response) => {
    res.json({ message: 'Hello!' });
});

app.listen(7000, () => {
    console.log("Server Started on localhost:7000");
});
