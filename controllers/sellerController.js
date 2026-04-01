import jwt from "jsonwebtoken"


// login seller  : /api/seller/login
export const sellerLogin = (res , req) => {
    const {email , passowrd} = req.body
    try {
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