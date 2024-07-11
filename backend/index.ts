import  express ,{Request, Response} from 'express';
import cors from 'cors'
import 'dotenv/config';
import mongoose from 'mongoose';
import myUserRoute from './src/Routes/Auth'
import connectDB from './src/dbconfig/db'

connectDB()
const app = express()
app.use(express.json())
app.use(cors()) 

///////////////////////////
app.use("/api/my/user", myUserRoute)
/////////////////////////////
app.get("/test", async (req:any, res: any)=>{
    res.json({ message:'Hello!'})
});


app.listen(7000, ()=>{
    console.log("Server Started on localhost:7000");
})