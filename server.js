import cookieParser from "cookie-parser"
import express from "express"
import cors from "cors"
import connectdb from "./configs/db.js"
import  "dotenv/config"
import userRouter from "./routes/userRoutes.js"
import sellerRouter from "./routes/sellerRoutes.js"
import connectCloudinary from "./configs/cloudinary.js"
import productRouter from "./routes/productRoute.js"
import cartRouter from "./routes/cartRoute.js"
import addressRouter from "./routes/addressRoute.js"
import orderRouter from "./routes/orderRoute.js"

const app = express()
const port = process.env.PORT || 4000

await connectdb()
await connectCloudinary()

const allowedOrigins = ['http://localhost:5173']

app.use(express.json()) // this is use to make the json format in the proper way
app.use(cookieParser()) //reads cookies from the request .. Stores them in the req.cookies

app.use(cors({origin : allowedOrigins , credentials: true}))

app.get('/', (req, res) => 
    res.send("Api is working ")
)

app.use("/api/user",userRouter)
app.use("/api/seller",sellerRouter)
app.use("/api/product" , productRouter)
app.use("/api/cart" , cartRouter)
app.use("/api/address" , addressRouter)
app.use("/api/order" , orderRouter)

app.listen(port, () => {
    console.log(`Server is successfully running on http://localhost:${port}`)
})