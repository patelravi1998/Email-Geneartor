// src/services/UserService.ts

import { EmailGenerator,EmailOrders,EmailResponse } from "../entities";
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
  changeUpiStatus,ipAddressDTO,EmailDTO,mailDTO,orderDTO
} from "../dtos/user/UserDTO";
import { getManager } from 'typeorm';
import { mySQl_dataSource } from '../config/database'; // Ensure you have this or replace with your DataSource setup
import logger from '../utils/logger'; // Adjust path as needed
import crypto from 'crypto';
import {razorpay} from '../razorpay'; // path adjust karo accordingly





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
  
  async createOrderDetails(data: orderDTO): Promise<any> {
    const emailOrder= new EmailOrders()
    console.log(`>>>>>>data${JSON.stringify(data)}`)
    emailOrder.email=data.email!
    emailOrder.days=data.days!
    emailOrder.amount=data.amount!
    emailOrder.expiry_date=data.expiry_date!
    emailOrder.user_email=data.user_email!
    emailOrder.mobile=data.mobile!
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
    logger.info(
      `Request Node Environment service: ${process.env.NODE_ENV}`
    );
    logger.info(
      `Request Body Of  Payment Webhook service : ${JSON.stringify(data)}`
    );
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;
    logger.info(
      `below webhookSecret`
    );

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(data)
      .digest('hex');
      logger.info(
        `below expectedSignature`
      );

    // Verify Signature

    logger.info(
      `expectedSignature ${expectedSignature}`
    );

    logger.info(
      `signature ${signature}`
    );
    if (expectedSignature !== signature) {
      logger.info(
        `Invalid Signature`
      );
        throw new ApiError(500, 500, "Invalid Signature");
    }

    const response = JSON.parse(data.toString());

    logger.info(
      `Webhook Received Data: ${JSON.stringify(response)}`
    );

    const payment = response.payload.payment.entity; // ✅ fixed here
    const razorpay_order_id = payment.order_id;

    if (!razorpay_order_id) {
        logger.info(
          `Missing order_id in payment webhook`
        );
        throw new ApiError(500, 500, "Missing order_id");
    }

    const order = await EmailOrders.findOne({ where: { razorpay_order_id } });
    if (!order) {
        logger.info(
          `Order Not Found For Order Id: ${razorpay_order_id} `
        );
        throw new ApiError(500, 500, "Order not found");
    }

    order.payment_status = "paid";
    await order.save();
}

  
  
  
  
  
}

// Export a singleton instance if desired
export default new UserService();
