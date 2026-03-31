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


// Login user : /api/user/login

export const login = async(req , res) =>{
    try {
        const {email , password} = req.body;

        if (!email || !password){
            return res.json({success : false , message : "Email and the password is required "})
        }

        const user = await User.findOne({email})

        if(!user){
            return res.json({success : false , message : "The provided email is invalid"})
        }

        const isMatch = await bcrypt.compare(password , user.password)

        if(!isMatch) {
            return res.json({success : false , message : "invalid email or the password"})
        }

        const token = jwt.sign({id:user._id}, process.env.JWT_SECRET , {expiresIn : "7d"})

        res.cookie('token' , token , { //res.cookie(name of the token, value, options that related to the cookie)
            httpOnly : true , // prevent javascript to access the cookie 
            sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax", // CSRF protection
            maxAge : 7 * 24 * 60 * 60 * 1000 //      Cookie expire time
        })

        return res.json({success : true , user : {email : user.email , name: user.name }})

    } catch (error) {
        console.log(error.message);
        res.json({success: false , message : error.message})
        
    }
}


// check Auth : /api/user/is-Auth

export const isAuth = async (req , res)=>{
    try {
        const {userId} = req.body 
        const user = await User.findById(userId).select("-password")
        return res.json({success: true  , user})
    } catch (error) {
        console.log(error.message);
        res.json({success : false , message : error.message})
        
    }
}

// logout : /api/user/logout

export const logout = async (req , res )=>{
    try {
        res.clearCookie('token' , {
            httpOnly : true , 
            secure : process.env.NODE_ENV ==="production" , 
            sameSite : process.env.NODE_ENV === "produciton" ? "none" : "strict" , 
        })

        return res.json({success : true  , message : " logged out "})
    } catch (error) {
        console.log(error.message) ; 
        res.json({success : false , message : error.message })
    }
}