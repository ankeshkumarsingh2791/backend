import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"

const userSchema = new Schema({
   
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        index: true, // if you want to search in database it makes life easier
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    fulName: {
        type: String,
        required: true,
        index: true,
        trim: true
    },
    avatar: {
        type: String, // clouDinary url
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
// pre hook used to do something before save
userSchema.pre("save", async function (next) {
    if( !this.isModified("password")) return next();// it will check password is modified or not
    this.password = await bcrypt.hash(this.password, 10) // password modified
    next()
} )

// custom methods to check password 
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

// jwt genrater
userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fulName: this.fulName
     
        },

        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )

}
userSchema.methods.generateRefreshToken = function(
    
){
    // jwt is a beearer token 
    return jwt.sign(
        {
            _id: this._id
           
        },

        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)