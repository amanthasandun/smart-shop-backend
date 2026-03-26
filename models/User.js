import mongoose from "mongoose";

const userSchema =new mongoose.Schema({
    name : {type : String , required : true},
    email : { type : string , required : true , unique : true } , 
    password : {type : string  , required : true } , 
    cartItems : {type : Object , default : {}}
},{
                     // Default behavior → MongoDB stores nothing for cartItems (empty object is removed).
    minimize : false // Mongoose keeps empty objects in the DB:
})

const User = mongoose.models.user || mongoose.model("User",userSchema)

export default User ;
