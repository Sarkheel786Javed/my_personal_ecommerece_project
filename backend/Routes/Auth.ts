import { Router } from 'express';
const {
  registerController,
  loginController,
  regenerateToken,
  getSingleuser,
  forgotPasswordController,
} = require ('../controllers/authController')

const router = Router();

// Route for user registration
router.post('/register', registerController);

// Route for user login
router.post('/login', loginController);

// Route for regenerating token
router.post('/regenerate-token', regenerateToken);

// Route for getting a single user (protected route)
router.get('/user/:userId', getSingleuser);

// Route for forgot password
router.post('/forgot-password', forgotPasswordController);

export default router;
