// src/routes/users.ts

import express from "express";
import UserController from "../controllers/UserController";
import { authMiddleware } from "../middleware/verifyToken";

const router = express.Router();

router.post('/generateEmail', UserController.generateEmail);  
router.post('/receive_email', UserController.receiveEmail);  
router.get('/userMails', UserController.getReceipientMails); 
router.post('/delete_mails', UserController.deleteInboxMail);  
router.post('/create-order', UserController.createOrder);  
router.post('/payment-webhook', UserController.savePaymentWebhook);  

export default router;
