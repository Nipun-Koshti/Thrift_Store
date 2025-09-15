import express from "express";
import { createUser , loginUser,LogOutUser } 
from "../controllers/userController.js";

import {authenticate, authorizeAdmin} from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").post(createUser).get(authenticate, authorizeAdmin);
router.post("/auth",loginUser);
router.post("/logout", LogOutUser)

export default router;

