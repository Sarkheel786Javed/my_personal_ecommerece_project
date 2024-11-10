import express from "express";
import multer from "multer";
import {UserRequestDepartmentController, AdminGetRequestDepartmentController} from "../../controllers/RequestDepartment/RequestDepartment";
const {decodeToken} = require ('../../middleware/authMiddleware')
const router = express.Router();

// Set up multer to handle file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/department/:departmentRequest', decodeToken, UserRequestDepartmentController);
router.get('/adminGetRequestDepartment', decodeToken, AdminGetRequestDepartmentController);

export default router;
