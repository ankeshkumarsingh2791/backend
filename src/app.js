import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credential: true
}))
// form data
app.use(express.json({
    limit: "16kb"
}))

// url data
app.use(express.urlencoded({extended: true, limit: "16kb"}))

// file storage
app.use(express.static("public"))

app.use(cookieParser())
 
// routes

import UserRouter from'./routes/User.routes.js'



// routes declaration 

app.use("api/v1/users", UserRouter)

export {app}