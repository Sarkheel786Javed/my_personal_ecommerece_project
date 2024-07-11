import  express ,{Request, Response} from 'express';
import cors from 'cors'
import 'dotenv/config';
import mongoose from 'mongoose';
import myUserRoute from './src/Routes/Auth'


mongoose
.connect(process.env.MONGO_CONNECTION_STRING as string)
.then(()=> console.log("Connented to database"));
 
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