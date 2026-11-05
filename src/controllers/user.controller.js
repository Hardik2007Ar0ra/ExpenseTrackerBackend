import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/user.models.js";
import jwt from "jsonwebtoken";


const registerUser = asyncHandler(async(req,res)=>{
    const {username,fullname,email,password}=req.body

    if(
        [fullname, email, username, password]
        .some((field)=>field?.trim()==="") //this is also to check whether any of these fields are empty or not
    ){
        throw new ApiError(400,"All fields are required")
    }

    const existingUser=await User.findOne({$or:[{username},{email}]})

    if(existingUser){
        throw new ApiError(404,"user with email or username already exists")
    }

    const user =await User.create({
        fullname,
        username:username.toLowerCase(),
        email,
        password
    })

    const createdUser= await User.findById(user?._id).select("-password -refreshtoken")

    if(!createdUser){
        throw new ApiError(500,"something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"user registered successfully")
    )

})

export {registerUser}