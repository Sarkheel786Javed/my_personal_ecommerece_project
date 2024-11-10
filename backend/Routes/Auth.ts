import express from 'express';
const { 
    registerController,
    loginController,
    forgotPasswordController,
    getSingleuser,
    getUsersByDepartment,
    regenerateToken,
    updateUserDepartmentsController
} = require('../controllers/MyUserControllers');
const router = express.Router();
// /api/my/user
// Route for user registration
router.post('/register', registerController);

// Route for user login
router.post('/login', loginController);
router.post("/update-user-departments/:userId", updateUserDepartmentsController);

// Route for regenerating token
router.post('/regenerate-token',  regenerateToken);

// Route for getting a single user (protected route)
router.get('/user/:userId', getSingleuser);

// Route for getting  user Department
router.get('/getalldepartment/:organization', getUsersByDepartment);

// Route for forgot password
router.post('/forgot-password', forgotPasswordController);



export default router;