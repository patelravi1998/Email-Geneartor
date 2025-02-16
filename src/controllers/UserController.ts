// src/controllers/UserController.ts

import { Request, Response, NextFunction } from "express";
import UserService from "../services/UserService";
import { ApiError } from "../middleware/errors";
import { changeUpiStatus ,ipAddressDTO,EmailDTO,mailDTO} from '../dtos/user/UserDTO';
import {userDetailsSchema ,sfaIdSchema ,upiDetailsSchema,ipAddressSchema,emailSchema,ipadress,deleteMailSchema} from '../validations/userDTO' // Import UserResponseDTO



export class UserController {
  async generateEmail(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { error, value: data } = ipAddressSchema.validate(req.body);
      if (error) {
        throw new ApiError(400, 400, error.details[0].message, error);
      }
      const ipAddress: ipAddressDTO = data;
      const response = await UserService.generateEmailAddress(ipAddress);
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
      // const { error, value: data } = emailSchema.validate(req.body);
      // if (error) {
      //   throw new ApiError(400, 400, error.details[0].message, error);
      // }
      const receivedEmaildata = req.body;
      console.log(`>>>>>body`,req.body)
      const emailData = await UserService.receiveMail(receivedEmaildata);
      res.sendSuccess(200,"Email Received Successfully");
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
  
}

// Export a singleton instance if desired
export default new UserController();