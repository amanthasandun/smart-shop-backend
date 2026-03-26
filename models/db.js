import mongoose from "mongoose";

const connectdb = async ()=>{
    try {
        mongoose.connection.on('connected',()=>console.log("Database get connected"))
        await mongoose.connect(`${process.env.MONGODB_URI}`)
    } catch (error) {
        console.log(error.message);
        
    }
}

export default connectdb