import Order from "../models/Orders.js"
import Product from "../models/Product.js"  
import Stripe from "stripe"


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

        await Order.create({
            userId , 
            items ,
            amount ,
            address , 
            paymentType : "COD"
        })
        
        return res.json({success : true  , message : "Order places successfully "})

    } catch (error) {
        return ({success:false , message : error.message})
    }
}


// place order by the stripe  : /api/order/stripe
export const placeOrderStripe = async (req , res ) =>{ 
    try {
        const {userId , items , address } = req.body
        const {origin} = req.headers


        if(!address || items.length === 0 ){
            return res.json({success : false , message : "invalid data" })
        }

        let productData = []
        // calculate the amount using the Items 

        let amount = await items.reduce(async ( acc , item )=>{

            const product = await Product.findById(item.product)
            productData.push({
                name : product.name,
                price  : product.offerPrice , 
                quantity : item.quantity,
            })
            return (await acc ) + product.offerPrice * item.quantity

        } , 0)

        // Add the tax charge
        amount += Math.floor(amount * 0.002)

        const order = await Order.create({
            userId , 
            items ,
            amount ,
            address , 
            paymentType : "Online" 
        })

        // stripe gateway initialize 

        const stripeInstance = new Stripe(process.env.STRIPE_SECREATE_KEY)

        // Create line items for the stripe 
        const line_Items = productData.map((item)=>{
            return{
                price_data : {
                    currency : "usd" ,
                    product_data : {
                        name :  item.name,
                    },
                    unit_amount : Math.floor(item.price + item.price*0.02) * 100
                },
                quantity : item.quantity
            }
        })


        // create session

        const session = await stripeInstance.checkout.sessions.create({
            line_items,
            mode : "payment" ,
            success_url : `${origin}/loader?next=my-orders` , 
            cancel_url : `${origin}/cart` , 
            metadata : {
                orderId : order._id.toString() ,
                userId , 
            }
        })
        
        return res.json({success : true  , url : session.url})

    } catch (error) {
        return ({success:false , message : error.message})
    }
}

// Get Orders by the users ID : /api/order/user

export const getUserOrders = async (req , res ) => {
    try {

        const userId = req.userId

        const orders = await Order.find({
            userId , // Get orders that belong to this specific user
            $or : [{paymentType : "COD" } , {isPaid : true}]  // Get orders where: (paymentType = COD) OR (isPaid = true)
        }).populate("items.product address").sort({createdAt : -1}) // populate() = "replace ID with actual document from another collection using the ref use id as the items.product and the address"
                                                                    // -1 → newest first  , 1 - olderst first we canuse createdAt , updateAt because of the use of timestamps

        res.json({success : true , orders})

    } catch (error) {
        res.json({success : false  , message : error.message})
    }
}

// get the all the order (for seller  , admin ) : /api/order/seller/

export const  getAllOrders = async (req , res ) =>{
    try {
        const orders = await Order.find({
            $or : [{paymentType : "COD"} , {isPaid : true}] // "At least ONE of the conditions must be true"
        }).populate("items.product address").sort({createdAt : -1})
        res.json({success : true , orders})
    } catch (error) {
        res.json({success : false  , message : error.message})
    }
}