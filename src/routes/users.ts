// src/routes/users.ts

import express from "express";
import UserController from "../controllers/UserController";
import { authMiddleware } from "../middleware/verifyToken";

const router = express.Router();

router.post('/generateEmail', UserController.generateEmail);  
router.post('/receive_email', UserController.receiveEmail);  
router.get('/userMails', UserController.getReceipientMails); 
router.post('/delete_mails', UserController.deleteInboxMail);  
router.post('/user_info', UserController.saveUserSupportQuery);  
export default router;
