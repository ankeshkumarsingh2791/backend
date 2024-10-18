import mongoose,{isValidObjectId} from "mongoose";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Tweet } from "../models/tweet.model.js";
import { asyncHandler } from "../utils/assyncHandler.js";
import {User} from "../models/user.model.js"

const createTweet = asyncHandler(async(req,res) =>{
    const {content} = req.body
    if(!content){
        throw new apiError(400, "Please enter the content")
    }

    const tweet = await Tweet.create({
        content,
        owner:req.User?._id
    })

})