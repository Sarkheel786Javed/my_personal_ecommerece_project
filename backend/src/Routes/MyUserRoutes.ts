import express from "express";
import MyUserController from '../controllers/MyUserControllers'

const router = express.Router();
// /api/my/user
router.post("/signup", MyUserController.createCurrentUser);


export default router;