import mongoose from "mongoose";

const userSchema =new mongoose.Schema({
    name : {type : String , required : true},
    email : { type : String , required : true , unique : true } , 
    password : {type : String  , required : true } , 
    cartItems : {type : Object , default : {}}
},{
                     // Default behavior → MongoDB stores nothing for cartItems (empty object is removed).
    minimize : false // Mongoose keeps empty objects in the DB:
})

const User = mongoose.models.User || mongoose.model("User",userSchema)
// if there exist model calles the User then use it , otherwise create a new model

export default User ;
