import express from "express"
import { register } from "../controllers/userController.js"


const userRouter = express.Router()

userRouter.post("/rejister" , register)

export default userRouter
