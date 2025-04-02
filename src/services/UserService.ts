// src/services/UserService.ts

import { EmailGenerator,EmailOrders,EmailResponse, SystemUser,UserQuery } from "../entities";
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
  changeUpiStatus,ipAddressDTO,EmailDTO,mailDTO,orderDTO,signupDTO,userQueryDTO
} from "../dtos/user/UserDTO";
import { getManager ,LessThanOrEqual, MoreThan, MoreThanOrEqual} from 'typeorm';
import { mySQl_dataSource } from '../config/database'; // Ensure you have this or replace with your DataSource setup
import logger from '../utils/logger'; // Adjust path as needed
import crypto from 'crypto';
import {razorpay} from '../razorpay'; // path adjust karo accordingly
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import moment from 'moment'







export class UserService {
  async generateEmailAddress(ipAddressData: ipAddressDTO): Promise<string> {
    const domains = ["markdownviewer.online", "disposableemaihub.com"]; // List of domains
    let email: string;
    let emailExists: EmailGenerator | null;
  
    do {
      const username = faker.internet.userName().toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 6);
      const domain = domains[Math.floor(Math.random() * domains.length)]; // Randomly select a domain
      email = `${username}@${domain}`;
  
      emailExists = await EmailGenerator.findOne({ where: { generated_email: email } });
  
    } while (emailExists); // Keep generating until we get a unique email
  
    const emailData = new EmailGenerator();
    emailData.generated_email = email;
    emailData.ipaddress = ipAddressData.ipadress!;
    await emailData.save();
  
    return email;
  }
  
  
  
  async receiveMail(receivedEmaildata: any,attachmentData:any): Promise<any> {
    if (isEmpty(receivedEmaildata.recipient)) {
      throw new ApiError(400, 400, "Invalid Mail");
    }
  
    const existingMail = await EmailGenerator.findOne({ where: { generated_email: receivedEmaildata.recipient } });
    if (!existingMail) {
      throw new ApiError(400, 400, "Recipient Mail Not Found");
    }
  
    logger.info(`Request Body In Service : ${JSON.stringify(receivedEmaildata)}`);
  
    const bodyHtml = receivedEmaildata["body-html"];
    const cleanedHtml = bodyHtml ? bodyHtml.replace(/[\r\n\t]/g, '') : "";
  
    const emailData = new EmailResponse();
    emailData.generated_email = receivedEmaildata.recipient;
    emailData.ipaddress = existingMail.ipaddress;
    emailData.date = receivedEmaildata.Date;
    emailData.sender_email = receivedEmaildata.from;
    emailData.sender_name = receivedEmaildata.from;
    emailData.subject = receivedEmaildata.subject;
    emailData.body = cleanedHtml;
  
    // Save attachments if they exist
    if (attachmentData) {
      emailData.attachments = JSON.stringify(attachmentData); // Save as JSON string
    }
  
    await emailData.save();
    return emailData;
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
  
  async createOrderDetails(data: orderDTO,userId:any): Promise<any> {
    const emailOrder= new EmailOrders()
    console.log(`>>>>>>data${JSON.stringify(data)}`)
    emailOrder.email=data.email!
    emailOrder.days=data.days!
    emailOrder.amount=data.amount!
    emailOrder.expiry_date=data.expiry_date!
    emailOrder.user_id=userId
    emailOrder.payment_status="initiated"
    await emailOrder.save()
    const order = await razorpay.orders.create({
      amount: data.amount! * 100, // paise
      currency: "INR",
      receipt: `receipt_${emailOrder.id}`,
      notes: {
        order_db_id: emailOrder.id
      }
    });
    emailOrder.razorpay_order_id=order.id
    await emailOrder.save()
    return emailOrder
  }
  
  async savePaymentStatus(data: any, signature: any): Promise<any> {
    logger.info(`Request Node Environment service: ${process.env.NODE_ENV}`);
    logger.info(`Request Body Of Payment Webhook service: ${JSON.stringify(data)}`);

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;
    logger.info(`Webhook Secret: ${webhookSecret}`);
    logger.info(`Received Signature: ${signature}`);

    // ✅ Ensure `data` is a string before hashing
    const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(JSON.stringify(data)) // Convert to string
        .digest("hex");

    logger.info(`Expected Signature: ${expectedSignature}`);

    // Verify Signature
    if (expectedSignature !== signature) {
        logger.error(`Invalid Signature`);
        throw new ApiError(500, 500, "Invalid Signature");
    }

    logger.info(`Signature Verified Successfully`);

    // const response = JSON.parse(data.toString());

    // logger.info(`Webhook Received Data: ${JSON.stringify(response)}`);

    // const payment = response.payload.payment.entity;
    const razorpay_order_id = data.payload.payment.entity.order_id

    if (!razorpay_order_id) {
        logger.error(`Missing order_id in payment webhook`);
        throw new ApiError(500, 500, "Missing order_id");
    }

    const order = await EmailOrders.findOne({ where: { razorpay_order_id:razorpay_order_id } });
    if (!order) {
        logger.error(`Order Not Found For Order Id: ${razorpay_order_id}`);
        throw new ApiError(500, 500, "Order not found");
    }

    order.payment_status = "paid";
    await order.save();

    logger.info(`Order ${razorpay_order_id} marked as PAID successfully`);
  }

  async getExpirationDateForMail(temporaryEmail: string): Promise<any> {
    let expiryDate=""
    const emailData= await EmailGenerator.findOneBy({generated_email:temporaryEmail})
    if(isEmpty(emailData)){
      throw new ApiError(500, 500, "Invalid Email");
    }
    const emailOrder= await EmailOrders.findOne({where:{email:temporaryEmail}})
    if(!isEmpty(emailOrder)){
      expiryDate=emailOrder.expiry_date
    }
    return expiryDate
  }

  async userRegistration(data: signupDTO): Promise<any> {
    const isUserExist= await SystemUser.findOne({where:{email:data.email}})
    if(!isEmpty(isUserExist)){
      throw new ApiError(500, 500, "Email already exists. Please log in.");
    }
    const hashedPassword = await bcrypt.hash(data.password!, 10);
    const user = new SystemUser()
    user.email=data.email!
    user.password=hashedPassword
    await user.save()
  }

  async userLoginProcess(data: signupDTO): Promise<any> {
    // Check if user exists
    const user = await SystemUser.findOne({ where: { email: data.email } });

    if (!user) {
      throw new ApiError(404, 404, "Email ID not found. Please sign up.");
    }

    // Compare the provided password with the hashed password
    const isPasswordValid = await bcrypt.compare(data.password!, user.password);
    if (!isPasswordValid) {
      throw new ApiError(401, 401, "Invalid password.");
    }
    const secret=process.env.JWT_SECRET as string
    console.log(`>>>>>secret`,secret)
    const token = jwt.sign(
      { id: user.id, email: user.email }, // Payload
      secret, // Secret key
      { expiresIn: "7d" } // Token expiration time
    );

    return {
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  async getUserPurchasedMails(userId: any): Promise<any> {
    let mails:any
    const today = moment().format('YYYY-MM-DD');
    const emailOrders = await EmailOrders.find({
      where: {
        user_id: userId,
        expiry_date: MoreThan(today)
      },
      select: ["email"] // Only select the email field
    });
    if(emailOrders.length>0){
      mails=emailOrders.map(order => order.email);
    }
    return mails
  }
  async saveUserQuery(data: userQueryDTO): Promise<any> {
    const userQuery= new UserQuery()
    userQuery.name=data.name!
    userQuery.email=data.email!
    userQuery.message=data.message!
    await userQuery.save()
  }
  
  
  

}

// Export a singleton instance if desired
export default new UserService();
