import express from 'express';
const { 
    registerController,
    loginController,
    forgotPasswordController,
    getSingleuser,
} = require('../controllers/MyUserControllers');

const router = express.Router();
// /api/my/user
router.post("/signup", registerController);
router.post("/login", loginController);
router.post("/forget", forgotPasswordController);
router.get(`/getUser/:userId`, getSingleuser);


export default router;