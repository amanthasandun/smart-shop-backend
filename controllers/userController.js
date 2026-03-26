// Rejister User  : api/user/rejister


import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js"

export const register = async (req , res )=>{
    try{
        const {name , email , password } = req.body

        if(!name || !email || !password){
            return res.json({success : false , message : "Missing detail"})
        }

        const existingUser = await User.findOne({email})

        if(existingUser){
            return res.json({success:false , message : " You are already get registerd"})
        }

        const hashPassword = await bcrypt.hash(password , 10)

        const user = await User.create({name , email , password : hashPassword})

        const token = jwt.sign({id:user._id}, process.env.JWT_SECRET , {expiresIn : "7d"})

        res.cookie('token' , token , {
            httpOnly : true , // prevent javascript to access the cookie 
            sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax", // CSRF protection
            maxAge : 7 * 24 * 60 * 60 * 1000 //      Cookie expire time
        })

        return res.json({success : true , user : {email : user.email , name: user.name }})



    }catch(error){
        console.log(error.message);
        res.json({success : false , message : error.message})
        
    }
}
