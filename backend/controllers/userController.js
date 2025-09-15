import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/createToken.js";

import asyncHandler from "../middleware/asyncHandeler.js";  

const createUser = asyncHandler(async (req,res)=>{
    const {username, email, password} = req.body;
    
    if(!username || !email || !password){
        throw new Error("Please provide the correct data");
    }

    const userExists = await User.findOne({email});



    if(userExists){
        res.status(400);
        throw new Error("User already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hasshedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({username , email, password:hasshedPassword});
   

    try{

        await newUser.save();
        

        generateToken(res, newUser._id);

        

        res.status(201).json({
            _id: newUser._id, 
            username: newUser.username,
            email: newUser.email,           
            isAdmin: newUser.isAdmin,
        });

    }catch(error){
        res.status(400);
        throw new Error("Invalid user data");
    }
});

const loginUser = asyncHandler(async (req,res)=>{
    const {email,password} = req.body;

    const existinguser =  await User.findOne({email});

    if(existinguser){
        const isPasswordValid = await bcrypt.compare(password, existinguser.password);

        if(isPasswordValid){
            generateToken(res, existinguser._id);

            res.status(200).json({
                _id: existinguser._id,
                username: existinguser.username,
                email: existinguser.email,
                isAdmin: existinguser.isAdmin,
            });

            
        }
    }
    else{
        res.status(401);
        throw new Error("Invalid email or password");
    }
})

const LogOutUser =  asyncHandler(async(req,res)=>{
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0), 
    });
    res.status(200).json({message: 'Logged out successfully'});
})


export { createUser ,loginUser,LogOutUser};
