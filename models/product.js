import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name : {type : String , required : true},
    description : { type : Array , required : true} , 
    price : {type : Number  , required : true } ,
    offerPrice : {type : Number  , required : true } ,
    image : {type : Array  , required : true } ,
    catergory : {type : Array  , required : true } ,
    inStock : {type : Boolean , required : true }
},{
    // how the schema should work
    timestamps : true
})

const Product = mongoose.model.product || mongoose.model("product" , productSchema)

export default Product