import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/createToken.js";

import asyncHandler from "../middleware/asyncHandeler.js";
import async from "express-async";

const createUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        throw new Error("Please provide the correct data");
    }

    const userExists = await User.findOne({ email });



    if (userExists) {
        res.status(400);
        throw new Error("User already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hasshedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ username, email, password: hasshedPassword });


    try {

        await newUser.save();


        generateToken(res, newUser._id);



        res.status(201).json({
            _id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            isAdmin: newUser.isAdmin,
        });

    } catch (error) {
        res.status(400);
        throw new Error("Invalid user data");
    }
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const existinguser = await User.findOne({ email });

    if (existinguser) {
        const isPasswordValid = await bcrypt.compare(password, existinguser.password);

        if (isPasswordValid) {
            generateToken(res, existinguser._id);

            res.status(200).json({
                _id: existinguser._id,
                username: existinguser.username,
                email: existinguser.email,
                isAdmin: existinguser.isAdmin,
            });


        }
        else{
             res.status(401);
            throw new Error("Invalid password")
        }
    }
    else {
        res.status(401);
        throw new Error("Invalid email or password");
    }
})

const LogOutUser = asyncHandler(async (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ message: 'Logged out successfully' });
})

const getAllUser = asyncHandler(async (req, res) => {
    const users = await User.find({});

    res.json(users);
})

const getCurrentUserData = asyncHandler(async (req, res) => {
    const user_id = req.user._id;

    const user = await User.findById(user_id).select("-password");

    if (user) {
        res.status(200).json(user);
    }
    else {
        res.status(404)
        throw new Error("User not found");
    }


})

const updateCurrentUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.username = req.body.username || user.username
        user.email = req.body.email || user.email

        const pass = await bcrypt.compare(req.body.password,user.password);


        let flag = false;


        if (pass) {

            const salt = await bcrypt.genSalt(10);

            const hashedpass = await bcrypt.hash(req.body.confirmPassword, salt)
            user.password = hashedpass;
            flag = true;

            console.log(flag);
        }

        const updatedUser = await user.save()
        updatedUser.password = undefined;
        if (flag) {
            res.status(200).json({
                message: "Password has been updated",
                data: updatedUser
            })
        } else {
            res.status(200).json(updatedUser);

        }
    }
    else {
        res.status(404)
        throw new Error("Unable to update the user data");
    }
})

const deleteUserById = asyncHandler(async(req,res)=>{
    const user = await User.findById(req.params.Id)

    if(user){

        if(user.isAdmin){
            res.status(400)

            throw new Error('Cannot delete admin user')
        }

        await User.deeteOne({_id:user._id})
        res.json({message:"User removed"})

    }else{
        res.status(404)
        throw new Error("User not found")
    }

})

const getUserById = asyncHandler(async(req,res)=>{
    const user =  await User.findById (req.params.id).select("-password");

    if(user){
        res.status(200).json(user);
    }else{
        res.status(404).json("User not found")
    }
})

const updateUserById = asyncHandler(async(req,res)=>{
    const user =  await User.findById (req.params.id).select("-password");

    if(user){
        user.username= req.body.username||user.username
        user.email= req.body.email||user.email
        user.isAdmin = Boolean(req.body.isAdmin)

        const updatedUser = await user.save()

        res.json({
            _id: updatedUser._id,
            username:updatedUser.username,
            email:updatedUser.email,
            isAdmin:updatedUser.isAdmin,
        })
    }
    else{
        res.status(404).json("User not found")

        throw new Error("User not found")
    }

})


export { createUser, loginUser, LogOutUser, getAllUser, getCurrentUserData, updateCurrentUserProfile, deleteUserById, getUserById, updateUserById};
