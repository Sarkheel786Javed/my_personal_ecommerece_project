import express from 'express';
const { registerController } = require('../controllers/MyUserControllers');


const router = express.Router();
// /api/my/user
router.post("/signup", registerController);


export default router;