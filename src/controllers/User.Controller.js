import { asyncHandler } from "../utils/assyncHandler.js";
import {apiError} from "../utils/apiError.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";
  // get user data from frontend
  // Validation means email check and not empty
  // check if user exist using email and user name
  // check for images and avatar
  // if have then upload to cloudinary and also check for avatar
  // create user object -- create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return res

  // now get user detail   


const registerUser = asyncHandler ( async (req,res) => {
  
    const {fulName, email, username, password}  = req.body
    console.log("email:" , email)
    console.log("fulName" , fulName)
    console.log(username)



    // validate 

    // if( fulName === "") {
    //     throw new apiError(400, "FulName is required")
    // }
     if([fulName, email, username, password].some((field) => field?. trim() === "")

     ){
        throw new apiError(400, "All fields are required")
     }
     // user check
     const existUser = await  User.findOne({
        $or: [{username}, {email}]
     })

     if(existUser){
        throw new apiError(409, "user with email or username already exist")
     }
    //  console.log(req.files)
     // file upload & handle 

     const avatarLocalPath =  req.files?. avatar[0]?.path;
     const coverImagePath = req.files?. coverImage[0]?.path;
    
      if(!avatarLocalPath){
        throw new apiError(400, "Avatar file is required")
      }

      const avatar =     await uploadOnCloudinary(avatarLocalPath)
      const coverImage = await uploadOnCloudinary(coverImagePath)  
      
      if(!avatar) {
        throw new apiError(400, "Avatar file is required")
      }
     

       // db entry
       User.create({
        fulName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username
       })

       // user create or not

       const createdUser =   await User.findById(User._id).select(
        "-password -refreshToken" // this two will not come
       )

       if(!createdUser){
        throw new apiError(500, "something went wrong while registering the user")
       }

       return res.status(201).json(
        new apiResponse(200, createdUser, "user registered successfully ")
       )
})

export {registerUser}