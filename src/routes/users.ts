// src/routes/users.ts

import express from "express";
import UserController from "../controllers/UserController";
import { authMiddleware } from "../middleware/verifyToken";

const router = express.Router();

router.post('/generateEmail', UserController.generateEmail);  
router.post('/receive_email', UserController.receiveEmail);  
router.get('/userMails', UserController.getReceipientMails); 
export default router;
