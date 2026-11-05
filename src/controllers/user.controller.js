import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/user.models.js";
import jwt from "jsonwebtoken";

const generateAccessAndrefreshTokens = async(userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken=User.generateAccessToken();
        const refreshToken=User.generateRefereshToken();
        user.refreshToken=refreshToken;
        await user.save({validateBeforeSave:false});
        
        return {accessToken,refreshToken};
    } catch (error) {
        throw new ApiError(500,"something went wrong, while generating access and refresh token")
    }
}

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

    const createdUser= await User.findById(user?._id).select("-password -refreshToken")

    if(!createdUser){
        throw new ApiError(500,"something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"user registered successfully")
    )

})

const loginUser = asyncHandler(async(req,res)=>{
    const {email,username,password}=req.body;

    if(!(username || email)){
        throw new ApiError(401,"username or password is required")
    }

    const user = await User.findOne({
        $or:[{username},{email}]
    })

    if(!user){
        throw new ApiError(404,"user not found")
    }

    const isPasswordValid= await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401,"password is incorrect")
    }

    const {accesstoken,refreshToken}= await generateAccessAndrefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    //to send cookies
    //this object makes cookies modifyable only through server, not frontend
    const options={
        httpOnly:true,
        secure:true,
    }

    return res
        .send(200)
        .cookie("accesstoken",accesstoken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(
            new ApiResponse(
                200,
                {
                    user:loggedInUser,accesstoken,refreshToken
                },
                "user logged in successfully"
            )
        )
})

const logoutUser = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset:{
                refreshToken:1
            }
        },
        {
            new:true
        }
    )

    const options={
        httpOnly:true,
        secure:true
    }

    return res 
        .send(200)
        .clearCookie("accesstoken",options)
        .clearCookie("refreshToken",options)
        .json(new ApiResponse(200,{},"user logged out"))
})

const refreshAccessToken=asyncHandler(async(req,res)=>{
    const incomingrefreshToken = req.cookie.refreshToken || req.body.refreshToken

    if(!incomingrefreshToken){
        throw new ApiError(401,"unauthorized request")
    }
    const decodedtoken=jwt.verify(incomingrefreshToken,process.env.REFRESH_TOKEN_SECRET)
    const user=await User.findById(decodedtoken?._id)

    if(!user){
        throw new ApiError(401,"invalid refresh token")
    }
    if(incomingrefreshToken!==user?.refreshToken){
        throw new ApiError(401,"refresh token is expired or used")
    }

    try {
        const options={
            httpOnly:true,
            secure:true
        }
    
        const {accessToken,newrefreshToken}=await generateAccessAndRefreshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newrefreshToken,options)
        .json(
            new ApiResponse(
                200,
                {accessToken,refreshToken:newrefreshToken},
                "Access token refreshed successfully"
            )
        )
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid refresh token")
    }
})

const getCurrentUser=asyncHandler(async(req,res)=>{
    return res.status(200).json(new ApiResponse(200,req.user,"current user fetched successfully"))
})

export {registerUser,loginUser,logoutUser,refreshAccessToken,getCurrentUser}