import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
    {

        userName:{
            type: String,
        },
        email:{
            type: String,
        },
        password:{
            type: String,
        },
        addressLine1:{
            type: String
        },
        phoneNumbber:{
            type: String
        },
        city:{
            type: String
        },
        country:{
            type: String,
        },
        answer:{
            type: String,
        },

    }
) 

const User = mongoose.model("User", userSchema)
export default User