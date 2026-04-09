import Order from "../models/Orders.js"
import Product from "../models/Product.js"  
import Stripe from "stripe"
import User from "../models/User.js"


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
        return res.json({success:false , message : error.message})
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
        
        const stripeSecretKey = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECREATE_KEY
        if (!stripeSecretKey) {
            return res.json({ success: false, message: "Stripe secret key is missing" })
        }
        const stripeInstance = new Stripe(stripeSecretKey)

        // Create line items for the stripe 
        const line_items = productData.map((item)=>{
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
        return res.json({success:false , message : error.message})
    }
}

//Strie webhooks to verify the payments Action : /stripe
export const stripeWebhooks = async (request , response )=>{
    // Stripe gateway initialize 
    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY)
    const sig = request.headers["stripe-signature"]
    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(
            request.body,
            sig ,
            process.env.STRIPE_WEBHOOK_SECRET , 
        )
    } catch (error) {
        response.status(400).send(`webhook mwssage ${error.message}`)
    }

    // handle the event 

    switch (event.type) {


        case "payment_intent.succeeded":{
            const paymentIntent = event.data.object
            const paymentIntentId = paymentIntent.id

            // getting session metadata
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent : paymentIntentId
            })

            const {orderId , UserId} = session.data[0].metadata

            // mark payment as paid 
            await Order.findByIdAndUpdate(orderId , {isPaid : true})
            // clear the user cart data
            await User.findByIdAndUpdate(userId ,{cartItems : {}})
            break;
        }
        
        case "payment_intent.payment_failed" : {
            const paymentIntent = event.data.object
            const paymentIntentId = paymentIntent.id

            // getting session metadata
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent : paymentIntentId
            })

            const {orderId} = session.data[0].metadata
            await Order.findByIdAndDelete(orderId)
        }
        default:
            console.error(`Unhandled Event type ${event.type}`)
            break;
    }
    response.json({received : true})
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