import Order from "../models/orders"
import Product from "../models/product"



//place Order cod : /api/order/cod
export const placeOrderCOD = async (req , res ) =>{ 
    try {
        const {userId , items , address } = req.body
        if(!address || items.length === 0 ){
            return res.json({success : false , message : "invalid data" })
        }

        // calculate the amount using the Items 

        let amount = await items.reduce(async ( acc , item )=>{
            const product = await Product.findById(item.product)
            return (await acc ) + product.offerPrice * item.quantity
        } , 0)

        // Add the tax charge
        amount += Math.floor(amount * 0.002)

        await order.create({
            userId , 
            items ,
            amount ,
            address , 
            paymentType : "COD"
        })
        
        return res.json({success : false  , message : "Order places successfully "})

    } catch (error) {
        return ({success:false , message : error.message})
    }
}

// Get Orders by the users ID : /api/order/user

export const getUserOrders = async (req , res ) => {
    try {

        const {userId} = req.body

        const orders = await Order.find({
            userId , // Get orders that belong to this specific user
            $or : [{paymentType : "COD" } , {isPaid : true}]  // Get orders where: (paymentType = COD) OR (isPaid = true)
        }).populate("items.product address").sort({createdAt : -1}) //populate() = "replace ID with actual document from another collection using the ref use id as the items.product and the address"
                                                                    // -1 → newest first  , 1 - olderst first we canuse createdAt , updateAt because of the use of timestamps

        res.json({success : true , orders})

    } catch (error) {
        res.json({success : false  , message : error.message})
    }
}

// get the all the order (for seller  , admin ) :   /api/order/seller/
export const  getAllOrders = async (req , res ) =>{
    try {
        const orders = (await Order.find({
            $or : [{paymentType : "COD"} , {isPaid : true}]   // "At least ONE of the conditions must be true"
        }).populate("items.product address")).sort({createdAt : -1})
        res.json({success : true , orders})
    } catch (error) {
        res.json({success : false  , message : error.message})
    }
}