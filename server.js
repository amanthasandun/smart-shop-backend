import cookieParser from "cookie-parser"
import express from "express"
import cors from "cors"
import connectdb from "./configs/db.js"
import  "dotenv/config"
import userRouter from "./routes/userRoutes.js"
import sellerRouter from "./routes/sellerRoutes.js"

const app = express()
const port = process.env.PORT || 4000

await connectdb()

const allowedOrigins = ['https://localhost:5173']

app.use(express.json()) // this is use to make the json format in the proper way
app.use(cookieParser()) //eads cookies from the request .. Stores them in the req.cookies
app.use(cors({origin : allowedOrigins , credentials: true   }))

app.get('/', (req, res) => 
    res.send("Api is working ")
)

app.use("/api/user",userRouter)
app.use("/api/seller",sellerRouter)

app.listen(port, () => {
    console.log(`Server is successfully running on http://localhost:${port}`)
})