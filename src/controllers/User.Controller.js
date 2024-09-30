import { asyncHandler } from "../utils/assyncHandler.js";
import {apiError} from "../utils/apiError.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";
import mongoose from "mongoose"
import jwt from "jsonwebtoken"
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
    //  const coverImagePath = req.files?. coverImage[0]?.path;

    let coverImagePath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImagePath = req.files.coverImage[0].path
    }
    
      if(!avatarLocalPath){
        throw new apiError(400, "Avatar file is required")
      }

      const avatar =     await uploadOnCloudinary(avatarLocalPath)
      const coverImage = await uploadOnCloudinary(coverImagePath)  
      
      if(!avatar) {
        throw new apiError(400, "Avatar file is required")
      }
     

       // db entry
       const user = await User.create({
        fulName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username
       })

       // user create or not

       const createdUser =   await User.findById(user._id).select(
        "-password -refreshToken" // this two will not come
       )

       if(!createdUser){
        throw new apiError(500, "something went wrong while registering the user")
       }

       return res.status(201).json(
        new apiResponse(200, createdUser, "user registered successfully ")
       )
})

// login 

const LoginUser = asyncHandler(async (req, res) => {
  // take userId and password or take data from req body
  // check username or email
  // check from data base
  // if user find then check password
  // access and refresh token
  // send tokens in cookies and sed response

  const {email, username, password} = req.body
  
  if(!(username || email)) {
    throw new apiError(400, "username or password required")
  }
    const user = await User.findOne({
    $or:[{username}, {email}]
  })

  if(!user){
    throw new apiError(400, "user does not exist") 
  }

  // password check
  
   const isPasswordValid = await   user.isPasswordCorrect(password)
   if(!isPasswordValid){
    throw new apiError(401, "Invalid user name or Password")
   }

   const {accessToken, refreshToken} =  await generateAccessAndRefreshToken(user._id)

   // cookies send

   const loggedInUser =   await  User.findById(user._id).select("-password -refreshToken") // updating data bse

   const options = {
    httpOnly: true,
    secure: true
   }

   return res.status(200).cookie("accessToken", accessToken, options)
   .cookie("refreshToken", refreshToken, options)
   .json(
    new apiResponse(
      200,
      {
        user: loggedInUser,accessToken,refreshToken
      },
      "user logged in successfully"
    )
   )

})

const generateAccessAndRefreshToken = async (userId) => {
  try {
   const user =  await User.findById(userId)
    const refreshToken =  user.generateRefreshToken()
    const accessToken = user.generateAccessToken()
    // storing refresh token in data base
     
    user.refreshToken = refreshToken
    await user.save({validateBeforeSave: false})

    return {accessToken, refreshToken}
    
  } catch (error) {
    throw new apiError(500, "something went wrong while refresh and access token" )
  }
}

// logout logic 

const Logout = asyncHandler(async( req, res) => {
   await  User.findByIdAndUpdate(
    req.user._id,
    {
      $set:{
        refreshToken: undefined
      },
    
    },
    {
      new: true
    }
   )

   const options = {
    httpOnly: true,
    secure: true
   }

   return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options)
   .json(new apiResponse(200, {}, "user logged Out"))
})

// refresh access token 

const refrehAccessToken = asyncHandler (async (req, res) => {
  const incomingRefreshToken =  req.cookies.refreshToken || req.body.refreshToken

  if(!incomingRefreshToken){
    throw new apiError(401, " unauthorized token")
  }

 try {
   const decodedToken =  jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
   const user =  User.findById(decodedToken?._id)
 
   if(!user){
     throw new apiError(401, " invalid refresh token")
   }
 
   if(incomingRefreshToken !== user?.refreshToken){
     throw new apiError(401, "Refresh token is expired")
   }
 
   const options = {
     httpOnly: true,
     secure: true
   }
   const {accessToken, newRefreshToken} =   await generateAccessAndRefreshToken(user._id)
   return res.status(200)
   .cookie("accessToken", accessToken, options)
   .cookie("refreshToken", newRefreshToken, options)
   .json(
     new apiResponse(
       200,{accessToken, refreshToken:newRefreshToken},
       "access token refreshed  "
     )
   )
 } catch (error) {
   throw new apiError(401, error?.message || "Invalid refresh token")
 }

})

// current password change

const changeCurrentPassword = asyncHandler(async(req,res) =>{
  const{oldPassword, newPassword} = req.body

  const user = await User.findById(req.user?._id)
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

  if(!isPasswordCorrect){
    throw new apiError(400, "Invalid old Password")
  }

  user.password = newPassword
  await  user.save({validateBeforeSave: false})
  return res
  .status(200)
  .json(
    new apiResponse(200, {}, "Password change successful")
  )

})

// get current user

const getCurrentUser = asyncHandler(async(req, res) => {
  return res
  .status(200)
  .json(
    200, req.user, " current user fetched successfully"
  )
})

// update user account 

const updateUserAccount = asyncHandler(async(req, res) => {
   const {fulName, email} = req.body

   if(!fulName || !email){
    throw new apiError(400, "All fields are required")
   }

   const user = User.findByIdAndUpdate(
    req.user?._id,{
      $set: {
        fulName,
        email: email
      }
    },
    {new: true}
   ).select("-password")

   return res.status(200)
   .json(new apiResponse(200, user, "Account details updated successfully"))
})

// update files  like avatar

const updateUserAvatr = asyncHandler(async(req, res) => {

 const avatarLocalPath = req.file?.path

 if(!avatarLocalPath) {
  throw new apiError(400, "Avatar files is missing")
 }

 const avatar = await uploadOnCloudinary(avatarLocalPath)

 if(!avatar.url) {
  throw new apiError(400, "Error while uploading on avatar")
 }

  const user = await User.findByIdAndUpdate(
  req.user?._id, {
    $set:{
      avatar: avatar.url
    }
  },
  {
    new: true
  }
 ).select("-password")

 return res.status(200)
 .json(
   new apiResponse(200, user, "Update avatar ")
 )

})

const updateCoverImage = asyncHandler(async(req, res) =>{
   const coverImagePath = req.file?.path

   if(!coverImagePath){
    throw new apiError(400, " cover image missing")
   }

   const coverImage = await uploadOnCloudinary(coverImagePath)
  
   
   if(!coverImage.url){
    throw new apiError(400, "Error while uploading cover image")
   }
   const user = await User.findByIdAndUpdate(
    req.user?._id, {
      $set:{
       coverImage: coverImage.url
      }
    },{new: true}
   ).select("-password")

   return res.status(200)
   .json(200, user, "coverImage added successfully")
})

export {registerUser, 
  LoginUser, 
  Logout, 
  refrehAccessToken, 
  changeCurrentPassword, 
  getCurrentUser, 
  updateUserAccount,
  updateUserAvatr,
  updateCoverImage}