import express from "express";
import { createUser , loginUser,LogOutUser, getAllUser, getCurrentUserData,updateCurrentUserProfile,deleteUserById ,getUserById, updateUserById} 
from "../controllers/userController.js";

import {authenticate, authorizeAdmin} from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").post(createUser).get(authenticate, authorizeAdmin, getAllUser);
router.post("/auth",loginUser);
router.post("/logout", LogOutUser)
router.route('/profile').get(authenticate, getCurrentUserData).put(authenticate, updateCurrentUserProfile);

router.route('/:id')
.delete(authenticate,authorizeAdmin, deleteUserById)
.get(authenticate, authorizeAdmin, getUserById )
.put(authenticate,authorizeAdmin,updateUserById)


export default router;

