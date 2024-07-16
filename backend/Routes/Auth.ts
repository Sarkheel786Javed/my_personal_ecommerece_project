import express from 'express';
const { 
    registerController,
    loginController,
} = require('../controllers/MyUserControllers');

const router = express.Router();
// /api/my/user
router.post("/signup", registerController);
router.post("/login", loginController);


export default router;