// src/routes/users.ts

import express from "express";
import UserController from "../controllers/UserController";
import { authMiddleware } from "../middleware/verifyToken";
import { Request, Response, NextFunction } from "express";
import logger from '../utils/logger'; // Adjust path as needed

const router = express.Router();

router.post('/generateEmail', UserController.generateEmail);  
router.post('/receive_email', UserController.receiveEmail);  
router.get('/userMails', UserController.getReceipientMails); 
router.post('/delete_mails', UserController.deleteInboxMail);  
router.post('/create-order',[authMiddleware], UserController.createOrder);  
// Instead of directly calling controller, we just send 200 OK immediately
router.post('/payment-webhooks', async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(200).send('OK'); // 🔁 Respond quickly to Razorpay
      UserController.savePaymentWebhook(req, res, next); // 🔄 Handle in background
    } catch (err) {
      logger.error("Webhook entry handler failed", err);
    }
});
  router.get('/get_expiration_date', UserController.getExpirationDate); 
router.post('/signup', UserController.userSignup);
router.post('/login', UserController.userLogin);  
router.get('/user_purchased_mails',[authMiddleware], UserController.getUserMails); 
router.post('/user_info', UserController.saveUserSupportQuery);  
router.get('/payment_status',[authMiddleware], UserController.getPaymentStatus); 
router.post('/forgot-password', UserController.forgetPassword);  
router.post('/reset-password/:token', UserController.resetPassword);  



export default router;
