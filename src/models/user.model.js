import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema({
   
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        index: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        
        trim: true
    },
    fullname: {
        type: String,
        required: true,
        index: true,
        trim: true
    },
    avatar: {
        type: String, // cloudinary url
        required: true
    },
    coverImage: {
        type:String
    },
    watchHistory:[
     {
        type: Schema.Types.ObjectId,
        ref: "Video"
    }
     ],
     password: {
        type: String,
        required: [true, 'password is required']
     },
     refreshToken: {
        type: String
     }

},{timestamps: true})

//password save

userSchema.pre("save", async function (next) {
    if( !this.isModified("password")) return next();
    this.password = bcrypt.hash(this.password, 10)
    next()
} )

// custom methods to check password 
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

// jwt genrater
userSchema.methods.generateAccessToken = function(){
    jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname
     
        },

        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.process.env.ACCESS_TOKEN_EXPIRY
        }
    )

}
userSchema.methods.generateRefreshToken = function(
    
){
    jwt.sign(
        {
            _id: this._id,
           
        },

        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)