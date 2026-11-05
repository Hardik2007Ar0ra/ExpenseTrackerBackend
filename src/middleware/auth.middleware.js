//here check whethere the user is authorized or not by comparing access token
//and generation of new access token from refresh token will be in controller only

import {ApiError} from '../utils/ApiError.js' //{} beacuse we are importing constant
import {asyncHandler} from '../utils/asyncHandler.js'
import jwt from 'jsonwebtoken'
import {User} from '../models/user.models.js'  //through this we can interact with DB

export const VerifyJWT = asyncHandler(async(req,res,next)=>{
    try {
        const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

        if(!token){
            throw new ApiError(401,"Unauthorized access")
        }
        //compared the access token coming from the access token secret
        const decodedtoken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)

        const user=await User.findById(decodedtoken?._id).select("-password -refreshToken")

        if(!user){
            throw new ApiError(401,"Invalid access token")
        }

        req.user=user;
        next()

    } catch (error) {
        throw new ApiError(401,"invalid access token")
    }
})