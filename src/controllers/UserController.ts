// src/controllers/UserController.ts

import { Request, Response, NextFunction } from "express";
import UserService from "../services/UserService";
import { ApiError } from "../middleware/errors";
import { changeUpiStatus ,ipAddressDTO,EmailDTO,mailDTO,orderDTO,signupDTO,userQueryDTO} from '../dtos/user/UserDTO';
import {userDetailsSchema ,sfaIdSchema ,upiDetailsSchema,ipAddressSchema,emailSchema,ipadress,deleteMailSchema,orderSchema,signupSchema,userQuerySchema} from '../validations/userDTO' // Import UserResponseDTO
import logger from '../utils/logger'; // Adjust path as needed

interface Attachment {
  filename: string;
  content: string;
  contentType: string;
  size: number;
}


export class UserController {
  async generateEmail(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { error, value: data } = ipAddressSchema.validate(req.body);
      if (error) {
        throw new ApiError(400, 400, error.details[0].message, error);
      }
      logger.info(
        `Request Node Environment : ${process.env.NODE_ENV}`
      );
      logger.info(
        `Request Body Of  Generate Email : ${JSON.stringify(req.body)}`
      );
      const ipAddress: ipAddressDTO = data;
      const response = await UserService.generateEmailAddress(ipAddress);
      logger.info(
        `Response  Of  Generate Email Api: ${JSON.stringify(response)}`
      );
      if (response) {
        res.sendSuccess(200,"Email Generated Successfully",response);
      } else {
        throw new ApiError(400, 400, 'Failed to Generate Email');
      }
    } catch (error) {
      next(error);
    }
  }


  

  
  async receiveEmail(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      logger.info(
        `Request Node Environment : ${process.env.NODE_ENV}`
      );
      logger.info(
        `Request Body Of  Receive Email : ${JSON.stringify(req.body)}`
      );    
    const attachmentData = (req.body.attachments || []).map((a: any) => {
    // if (!a.content) {
    // logger.error(`Attachment ${a.filename} has no content!`);
    // }
    return {
    filename: a.filename,
    content: a.content || '', // Ensure content exists even if empty
    contentType: a.contentType,
    size: a.size
    };
    });
    
    const emailData = await UserService.receiveMail(req.body, attachmentData);
    res.sendSuccess(200, "Email Received Successfully");
    } catch (error) {
    next(error);
    }
  }

  async getReceipientMails(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const ipAddress: any = req.query.ipadress;
      const temporaryEmail: any = req.query.temporaryEmail;

      
      console.log(`>>>>ipAddress`,ipAddress)
      const emailData = await UserService.getUserMails(ipAddress,temporaryEmail);
      if(emailData){
        res.sendSuccess(200,"Email Fetched Successfully",emailData);
      }else{
        throw new ApiError(400, 400, 'Emails Not Found');
      }
    } catch (error) {
       next(error);
    }
  }

  async deleteInboxMail(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { error, value: data } = deleteMailSchema.validate(req.body);
      if (error) {
        throw new ApiError(400, 400, error.details[0].message, error);
      }
      const mail: mailDTO = data;
      const response = await UserService.deleteInboxEmails(mail);
      if (response) {
        res.sendSuccess(200,"Inbox Email Deleted Successfully",response);
      } else {
        throw new ApiError(400, 400, 'Failed to Delete Inbox Email');
      }
    } catch (error) {
      next(error);
    }
  }

  async createOrder(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      logger.info(
        `Request Node Environment : ${process.env.NODE_ENV}`
      );
      logger.info(
        `Request Body Of  Create Order : ${JSON.stringify(req.body)}`
      );
      if (!req.user || !req.user.id) {
        throw new ApiError(400, 400, "User not authenticated");
      }
      const userId = req?.user?.id;
      const { error, value: data } = orderSchema.validate(req.body);
      if (error) {
        throw new ApiError(400, 400, error.details[0].message, error);
      }
      const order: orderDTO = data;
      const response = await UserService.createOrderDetails(order,userId);
      if (response) {
        res.sendSuccess(200,"Order Created Successfully",response);
      } else {
        throw new ApiError(400, 400, 'Failed to Create Order');
      }
    } catch (error) {
      next(error);
    }
  }
  
  async savePaymentWebhook(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      logger.info(
        `Request Node Environment : ${process.env.NODE_ENV}`
      );
      logger.info(
        `Request Body Of  Payment Webhook : ${JSON.stringify(req.body)}`
      );
      const signature = req.headers['x-razorpay-signature'] as string;

      const response = await UserService.savePaymentStatus(req.body,signature);
      if (response) {
        res.sendSuccess(200,"Payment Status Saved Successfully",response);
      } else {
        throw new ApiError(400, 400, 'Failed to Save Payment Status');
      }
    } catch (error) {
      next(error);
    }
  }
  
  async getExpirationDate(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const temporaryEmail: any = req.query.temporaryEmail;

      
      console.log(`>>>>temporaryEmail`,temporaryEmail)
      const emailData = await UserService.getExpirationDateForMail(temporaryEmail);
      res.sendSuccess(200,"Email Fetched Successfully",emailData);
    } catch (error) {
       next(error);
    }
  }
  
  async userSignup(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      logger.info(
        `Request Node Environment : ${process.env.NODE_ENV}`
      );
      logger.info(
        `Request Body Of  Signup : ${JSON.stringify(req.body)}`
      );
      const { error, value: data } = signupSchema.validate(req.body);
      if (error) {
        throw new ApiError(400, 400, error.details[0].message, error);
      }
      const registerData: signupDTO = data;
      
      const result = await UserService.userRegistration(registerData);
      res.sendSuccess(200,"User Registered Successfully",result);
    } catch (error) {
       next(error);
    }
  }

  async userLogin(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      logger.info(
        `Request Node Environment : ${process.env.NODE_ENV}`
      );
      logger.info(
        `Request Body Of  Signup : ${JSON.stringify(req.body)}`
      );
      const { error, value: data } = signupSchema.validate(req.body);
      if (error) {
        throw new ApiError(400, 400, error.details[0].message, error);
      }
      const registerData: signupDTO = data;
      
      const result = await UserService.userLoginProcess(registerData);
      res.sendSuccess(200,"User SignIn  Successfully",result);
    } catch (error) {
      next(error);
    }
  }
  
  
  async getUserMails(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      if (!req.user || !req.user.id) {
        throw new ApiError(400, 400, "User not authenticated");
      }
      const userId = req?.user?.id;
      const response = await UserService.getUserPurchasedMails(userId);
      res.sendSuccess(200,"User Mail Fetched Successfully",response);
    } catch (error) {
      next(error);
    }
  }

  async saveUserSupportQuery(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { error, value: data } = userQuerySchema.validate(req.body);
      if (error) {
        throw new ApiError(400, 400, error.details[0].message, error);
      }
      const mail: userQueryDTO = data;
      const response = await UserService.saveUserQuery(mail);
      res.sendSuccess(200,"Message Sent Successfully");
    } catch (error) {
      next(error);
    }
  }

  async getPaymentStatus(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      if (!req.user || !req.user.id) {
        throw new ApiError(400, 400, "User not authenticated");
      }
      const userId = req?.user?.id;
      const razorPayId: any = req.query.razorpay_order_id;

      const response = await UserService.getPaymentStatusOfUserMail(userId,razorPayId);
      res.sendSuccess(200,"User Mail FPayment Status Fetched Successfully",response);
    } catch (error) {
      next(error);
    }
  }
  
  
}

// Export a singleton instance if desired
export default new UserController();