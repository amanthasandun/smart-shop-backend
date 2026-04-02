import { v2 as cloudinary } from "cloudinary";
// add product : /api/product/add
export const addProduct = async (req , res)=>{
    try {
        const productData = JSON.parse(req.body.productData)

        const images = req.files

        let imageUrl = await Promise.all(
            images.map(async (item)=>{
                let result = await cloudinary.uploader.upload(item.path , {resource_type : 'image'})
                return  result.secure_url
            })
        )
        await Product.create({...productData  , image : imageUrl})

        res.json({success : true , message : "product added"})
    } catch (error) {
        console.log(error.message);
        res.json({success : false , message : error.message})
    }
}

// get product : /api/product/list
export const productList = (req , res)=>{
    
}

// get product by id : /api/product/id
export const productById = (req , res)=>{
    
}

// change product by id : /api/product/stock
export const changeStock = (req , res)=>{
    
}
