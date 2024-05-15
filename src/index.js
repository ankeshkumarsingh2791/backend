// require('dotenv').config({path: './env'})

import dotenv from "dotenv"
// import mongoose from "mongoose"
// import { DB_NAME } from "./constants"
import connectDb from "./db/index.js"
import { app } from "./app.js"

dotenv.config({
    path: './env'
})
 connectDb()
 .then(() =>{
  app.listen(process.env.PORT || 8000, () =>{
    console.log(`server is running at port : ${process.env.PORT} `)
  } )
 })
 .catch((error) => {
  console.log("Db connection failed", error)
 })










/*
import express from "express"
const app = express() 

( async () => {
    try {
       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       app.on("error",() => {
        console.log('ERRR:', error);
        throw error
       })

       app.listen(process.env.PORT, ()=>{
        console.log(`App is listening on port ${process.env.PORT}`)
       })
        
    } catch (error) {
      console.log("ERROR", error) 
      throw err 
    }
})()
*/