import jwt from "jsonwebtoken";

const  authSeller = async( req  , res  , next)=>  { 
    const {sellerToken } = req.cookies ; 

    if (!sellerToken) { 
        res.json({success : false , message : " not authrized "})
    }

    try {
        const decodeToken = jwt.verify(sellerToken , process.env.JWT_SECRET)
        if(decodeToken.email === process.env.SELLER_EMAIL){
            next()
        }else{
            return res.json({success : false ,message : "not autherized "})
        }
    } catch (error) {
        res.json({success : false ,message : error.message })
    }
}

export default authSeller