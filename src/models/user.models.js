import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypyt from "bcrypt"

const UserSchema = new Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    fullname:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:[true,"Password is required"]
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    refreshToken:{
        type:String
    }
})

UserSchema.pre("save",async function (){
    if(!this.isModified(this.password)){
        return ;
    }
    this.password= await bcrypt.hash(this.password, 10)
})

UserSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypyt.compare(password,this.password)
}

UserSchema.methods.generateAccessToken = async function (){
    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username,
            fullname:this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

UserSchema.methods.generateRefershToken = async function(){
    return jwt.sign(
        {
            _id:this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User",UserSchema)