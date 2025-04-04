// src/controllers/UserController.ts

import { Request, Response, NextFunction } from "express";
import UserService from "../services/UserService";
import { ApiError } from "../middleware/errors";
import { changeUpiStatus ,ipAddressDTO,EmailDTO,mailDTO,userQueryDTO} from '../dtos/user/UserDTO';
import {userDetailsSchema ,sfaIdSchema ,upiDetailsSchema,ipAddressSchema,emailSchema,ipadress,deleteMailSchema,userQuerySchema} from '../validations/userDTO' // Import UserResponseDTO
import logger from '../utils/logger'; // Adjust path as needed




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
      logger.info(`Request Node Environment : ${process.env.NODE_ENV}`);
      logger.info(`Request Body Of Receive Email : ${JSON.stringify(req.body)}`);
  
      // Check if there are any files (attachments) in the request
      let attachmentData

      if (Array.isArray(req.files) && req.files.length > 0) {
        logger.info(`Attachments Received: ${JSON.stringify(req.files)}`);
  
        // Process each attachment
        for (const file of req.files) {
           attachmentData = {
            filename: file.originalname,
            content: file.buffer.toString('base64'), // Convert file buffer to base64
            contentType: file.mimetype,
            size: file.size,
          };
  
          // Save the attachment data to the database or process it as needed
        }
      }
  
      const receivedEmaildata = req.body;
      console.log(`>>>>>body`, req.body);
  
      const emailData = await UserService.receiveMail(receivedEmaildata,attachmentData);
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
  
}

// Export a singleton instance if desired
export default new UserController();