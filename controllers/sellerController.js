import jwt from "jsonwebtoken"


// login seller  : /api/seller/login
export const sellerLogin = (res , req) => {
    try {
        const {email , passowrd} = req.body
        if (!email || ! passowrd ){
            res.json({success : false , message : "Both fields are required"})
        }

        if(email === process.env.SELLER_EMAIL && passowrd === process.env.SELLER_ENV){
            const token = jwt.sign({email:email} , process.env.JWT_SECRET , {expiresIn : "7d"})

            res.cookie("sellerToken" , token , {
                httpOnly : true ,
                secure : process.env.NODE_ENV === "production" ,
                sameSite : process.env.NODE_ENV === "production" ? "None" : "strict" , 
                maxAge : 7 * 24 * 60 * 60 * 1000
            })

            return res.json({success : true  , message : "logged in"})
        }else{
            return res.json({success : false , message : "Invalid credential"})
        }
    } catch (error) {
        res.json({success : false , message : error.message})
    }
}

// seller Auth : /api/seller/is-auth
export const isAuth = async (req , res) =>{
    try {
        return res.json({success : true})
    } catch (error) {
        res.json({success:false , message : error.message})
    }
}


// seller logout : /api/seller/logout 

export const sellerLogout = async (res , req) => {
    try {
        res.clearCookie("sellerToken" , {
            httpOnly : true ,
            secure : process.env.NODE_ENV === "production" ,
            sameSite : process.env.NODE_ENV === "production" ? "None" : "strict"
        })

        return res.json({success : true , message : "Successfully logout "})
    } catch (error) {
        return res.json({success : false , message :error.message})
    }
}