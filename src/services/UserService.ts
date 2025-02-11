// src/services/UserService.ts

import { EmailGenerator,EmailResponse } from "../entities";
import { ApiError } from "../middleware/errors";
// import logger from '../utils/logger';
import axios from "axios";
import fs from "fs";
import path from "path";
import { createCanvas, loadImage, registerFont } from "canvas";
import PublicService from "../services/PublicService";
import logger from "../utils/logger";
import { isEmpty } from "lodash";
import { faker } from '@faker-js/faker';
import {
  UpdateUserDetailsDTO,
  changeUpiStatus,ipAddressDTO,EmailDTO
} from "../dtos/user/UserDTO";


export class UserService {
  async generateEmailAddress(ipAddressData:ipAddressDTO): Promise<any> {
    const domain = "markdownviewer.online"; 
    const username = faker.internet.userName().toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 6); 
    const email = `${username}@${domain}`;
    const emailData= new EmailGenerator()
    emailData.generated_email = email;
    emailData.ipaddress=ipAddressData.ipadress!
    await emailData.save();
    logger.info(
      `Email Generated: ${JSON.stringify(emailData)}`
    );
    return email;
  }
  
  async receiveMail(receivedEmaildata:any): Promise<any> {
    logger.info(
      `Request Body Of Email Service: ${JSON.stringify(receivedEmaildata)}`
    );
    if(isEmpty(receivedEmaildata.recipient)){
      throw new ApiError(400, 400, "Invalid Mail");
    }
    const existingMail=await EmailGenerator.findOne({where:{generated_email:receivedEmaildata.recipient}})
    if(existingMail){
      const bodyHtml=receivedEmaildata["body-html"]
      const cleanedHtml = bodyHtml!.replace(/[\r\n\t]/g, '');
      const emailData= new EmailResponse()
      emailData.generated_email = receivedEmaildata.recipient!; 
      emailData.ipaddress=existingMail.ipaddress
      emailData.date=receivedEmaildata.Date!
      emailData.sender_email=receivedEmaildata.from!
      emailData.subject=receivedEmaildata.subject!
      emailData.body=cleanedHtml
      await emailData.save(); 
      return emailData;
    }else{
      throw new ApiError(400, 400, "Receipient Mail Not Found");
    }
  }

  async getUserMails(ipAddress:string): Promise<any> {
    logger.info(
      `Requested Body Of Email Service: ${JSON.stringify(ipAddress)}`
    );
    if(isEmpty(ipAddress)){
      throw new ApiError(400, 400, "Invalid User");
    }
    const existingMail = await EmailResponse.find({
      where: { ipaddress: ipAddress },
      order: { id: "DESC" } // Corrected order syntax
    });
    return existingMail
  }
}

// Export a singleton instance if desired
export default new UserService();
