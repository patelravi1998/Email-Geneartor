// src/services/UserService.ts

import { EmailGenerator,EmailResponse } from "../entities";
import { ApiError } from "../middleware/errors";
import axios from "axios";
import fs from "fs";
import path from "path";
import { createCanvas, loadImage, registerFont } from "canvas";
import PublicService from "../services/PublicService";
import { isEmpty } from "lodash";
import { faker } from '@faker-js/faker';
import {
  UpdateUserDetailsDTO,
  changeUpiStatus,ipAddressDTO,EmailDTO,mailDTO
} from "../dtos/user/UserDTO";
import { getManager } from 'typeorm';
import { mySQl_dataSource } from '../config/database'; // Ensure you have this or replace with your DataSource setup
import logger from '../utils/logger'; // Adjust path as needed





export class UserService {
  async generateEmailAddress(ipAddressData: ipAddressDTO): Promise<string> {
    const domain = "markdownviewer.online"; 
    let email: string;
    let emailExists: EmailGenerator | null;
  
    do {
      const username = faker.internet.userName().toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 6);
      email = `${username}@${domain}`;
  
      emailExists = await EmailGenerator.findOne({ where: { generated_email: email } });
  
    } while (emailExists); // Keep generating until we get a unique email
  
    const emailData = new EmailGenerator();
    emailData.generated_email = email;
    emailData.ipaddress = ipAddressData.ipadress!;
    await emailData.save();
  
    return email;
  }
  
  
  async receiveMail(receivedEmaildata:any): Promise<any> {
    if(isEmpty(receivedEmaildata.recipient)){
      throw new ApiError(400, 400, "Invalid Mail");
    }
    const existingMail=await EmailGenerator.findOne({where:{generated_email:receivedEmaildata.recipient}})
    if(existingMail){
      logger.info(
        `Request Body In Service : ${JSON.stringify(receivedEmaildata)}`
      );
      const bodyHtml=receivedEmaildata["body-html"]
      const cleanedHtml = bodyHtml!.replace(/[\r\n\t]/g, '');
      const emailData= new EmailResponse()
      emailData.generated_email = receivedEmaildata.recipient!; 
      emailData.ipaddress=existingMail.ipaddress
      emailData.date=receivedEmaildata.Date!
      emailData.sender_email=receivedEmaildata.from!
      emailData.sender_name=receivedEmaildata.from!
      emailData.subject=receivedEmaildata.subject!
      emailData.body=cleanedHtml
      await emailData.save(); 
      return emailData;
    }else{
      throw new ApiError(400, 400, "Receipient Mail Not Found");
    }
  }

  async getUserMails(ipAddress: string, temporaryEmail: string): Promise<any> {
    if (isEmpty(ipAddress) || isEmpty(temporaryEmail)) {
      throw new ApiError(400, 400, "Invalid User");
    }
  
    try {
      // Use the 'query' method from DataSource
      const result = await mySQl_dataSource!.query(
        `SELECT * FROM email_response WHERE ipaddress = ? AND generated_email = ? and status=1 ORDER BY id DESC`,
        [ipAddress, temporaryEmail] // Pass both parameters in the array
      );
  
      return result;
    } catch (error) {
      console.error("Error fetching user mails:", error);
      throw new ApiError(500, 500, "Internal Server Error");
    }
  }

  async deleteInboxEmails(temporaryEmail: mailDTO): Promise<any> {
    if (isEmpty(temporaryEmail.mail)) {
      throw new ApiError(400, 400, "Invalid User");
    }
  
    try {
      // Use the 'query' method from DataSource 
      const result = await mySQl_dataSource!.query(
        `UPDATE email_response SET status = 0 WHERE generated_email = ? AND status = 1`,
        [temporaryEmail.mail] // Pass the email as a parameter
      );
  
      return result;
    } catch (error) {
      console.error("Error deleting inbox emails:", error);
      throw new ApiError(500, 500, "Internal Server Error");
    }
  }
  

  
  
  
  
}

// Export a singleton instance if desired
export default new UserService();
