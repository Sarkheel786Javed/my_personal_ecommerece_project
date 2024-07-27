import express from 'express';
const { 
    registerController,
    loginController,
    forgotPasswordController,
    getSingleuser,
    regenerateToken
} = require('../controllers/MyUserControllers');

const router = express.Router();
// /api/my/user
router.post("/signup", registerController);
router.post("/login", loginController);
router.post("/forget", forgotPasswordController);
router.post('/regenerate-token/:token',   regenerateToken);
router.get(`/getUser/:userId`, getSingleuser);



export default router;