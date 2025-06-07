// src/services/UserService.ts

import { EmailGenerator,EmailOrders,EmailResponse, Referal, SystemUser,UserClick,UserQuery } from "../entities";
import { ApiError } from "../middleware/errors";
import axios from "axios";
import fs from "fs";
import path from "path";
import { createCanvas, loadImage, registerFont } from "canvas";
import PublicService from "../services/PublicService";
import { isEmpty } from "lodash";
import { da, el, faker } from '@faker-js/faker';
import {
  UpdateUserDetailsDTO,
  changeUpiStatus,ipAddressDTO,EmailDTO,mailDTO,orderDTO,signupDTO,userQueryDTO,forgetDTO,resetDTO,clickDTO,referDTO
} from "../dtos/user/UserDTO";
import { getManager ,LessThanOrEqual, MoreThan, MoreThanOrEqual} from 'typeorm';
import { mySQl_dataSource } from '../config/database'; // Ensure you have this or replace with your DataSource setup
import logger from '../utils/logger'; // Adjust path as needed
import crypto from 'crypto';
import {razorpay} from '../razorpay'; // path adjust karo accordingly
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import moment from 'moment'
import { getRepository } from 'typeorm';
import nodemailer from 'nodemailer'





interface Attachment {
  filename?: string;
  content?: string;  // Base64 encoded content
  contentType?: string;
  size?: number;
}

interface ReceivedEmailData {
  to: string[];
  from: string;
  subject: string;
  text?: string;
  html?: string;
  date: Date;
}




export class UserService {
  async generateEmailAddress(ipAddressData: ipAddressDTO): Promise<string> {
    const domains = ["tempemailbox.com"]; // List of domains
    let email: string;
    let emailExists: EmailGenerator | null;
  
    do {
      const username = faker.internet.userName().toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 6);
      const domain = domains[Math.floor(Math.random() * domains.length)]; // Randomly select a domain
      email = `${username}@${domain}`;
      console.log(`>>>email`,email)
  
      emailExists = await EmailGenerator.findOne({ where: { generated_email: email } });
      console.log(`>>>>emailExists${JSON.stringify(emailExists)}`)
  
    } while (emailExists); // Keep generating until we get a unique email
    console.log(`>>>asaaaaa`)
  
    const emailData = new EmailGenerator();
    emailData.generated_email = email;
    emailData.ipaddress = ipAddressData.ipadress!;
    const today = new Date();
    const expirationDate = new Date(today.getTime() + 7 * 86400000); // 7 days later
    emailData.expiration_date = expirationDate.toISOString().split('T')[0]; 
    await emailData.save();
  
    return email;
  }
  
  
  
  

  

  
  async receiveMail(receivedEmaildata: any, attachmentData: Attachment[]): Promise<any> {
    logger.info(
      `Request Body Of  Receive Email Service Logic : ${JSON.stringify(receivedEmaildata)}`
    );   
    if (!receivedEmaildata.to || receivedEmaildata.to.length === 0) {
    throw new ApiError(400, 400, "Invalid Mail");
    }
    const recipient = receivedEmaildata.to[0];
    
    const existingMail = await EmailGenerator.findOne({ where: { generated_email: recipient } });
    if (!existingMail) {
      logger.info(`Recipient Mail Not Found: ${JSON.stringify(existingMail)}`);
      throw new ApiError(400, 400, "Recipient Mail Not Found");
    }
    const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
    console.log(`>>>>>today`,today)
    if (today > existingMail.expiration_date!) {
      throw new ApiError(400, 400,"This email has already expired. Please generate a new one.");
    }
    
    logger.info(`Request Body In Service : ${JSON.stringify(receivedEmaildata)}`);
    
    const cleanedHtml = receivedEmaildata.html ? receivedEmaildata.html.replace(/[\r\n\t]/g, '') : "";
    
    const emailData = new EmailResponse();
    emailData.generated_email = recipient;
    emailData.ipaddress = existingMail.ipaddress;
    emailData.date = receivedEmaildata.date;
    emailData.sender_email = receivedEmaildata.from;
    emailData.sender_name = receivedEmaildata.from;
    emailData.subject = receivedEmaildata.subject;
    emailData.body = cleanedHtml || receivedEmaildata.text || '';
    
    // Save only attachments with content
    if (attachmentData && attachmentData.length > 0) {
    const validAttachments = attachmentData.filter((att: Attachment) =>
    att.content && att.content.length > 0
    );
    if (validAttachments.length > 0) {
    emailData.attachments = JSON.stringify(validAttachments);
    }
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
    emailOrder.ipaddress=data.ipaddress!
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
    const emailData = await EmailGenerator.findOne({ where: { generated_email: order.email } });
    if(emailData){
      emailData.expiration_date=order.expiry_date
      await emailData.save()
    }

    logger.info(`Order ${razorpay_order_id} marked as PAID successfully`);
  }

  async getExpirationDateForMail(temporaryEmail: string): Promise<any> {
    let expiryDate=""
    const emailData= await EmailGenerator.findOneBy({generated_email:temporaryEmail})
    if(!isEmpty(emailData)){
      return expiryDate
    }
    return expiryDate

  }

  async userRegistration(data: signupDTO): Promise<any> {
    const disallowedDomain = 'tempemailbox.com';
    const emailDomain = data.email?.split('@')[1];
  
    if (emailDomain === disallowedDomain) {
      throw new ApiError(400, 400, `Email addresses from ${disallowedDomain} are not allowed.`);
    }
  
    const isUserExist = await SystemUser.findOne({ where: { email: data.email } });
    if (!isEmpty(isUserExist)) {
      throw new ApiError(500, 500, 'Email already exists. Please log in.');
    }
  
    const hashedPassword = await bcrypt.hash(data.password!, 10);
    const user = new SystemUser();
    user.email = data.email!;
    user.password = hashedPassword;
    await user.save();
    const referalData=await Referal.findOne({where:{referal_to_email:data.email,is_referal_given:0}})
    if(referalData){
      const existingMail = await EmailGenerator.findOne({ where: { generated_email: referalData.referal_by_email } });
      if (existingMail?.expiration_date) {
        const currentExpiration = new Date(existingMail.expiration_date); // convert string to Date
        const newExpiration = new Date(currentExpiration.getTime() + 7 * 86400000); // add 7 days
        existingMail.expiration_date = newExpiration.toISOString().split('T')[0]; // format as YYYY-MM-DD
        await existingMail.save();
        referalData.is_referal_given=1
        await referalData.save()
      }
    }
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
    const today = moment().format('YYYY-MM-DD');
  
    const emailOrders = await mySQl_dataSource!
      .getRepository(EmailOrders)
      .createQueryBuilder('eo')
      .select(['eo.email', 'eo.ipaddress', 'eo.expiry_date']) // select only needed fields
      .where('eo.user_id = :userId', { userId })
      .andWhere('eo.expiry_date > :today', { today })
      .andWhere('eo.payment_status = :status', { status: 'paid' })
      .orderBy('eo.email', 'ASC')
      .addOrderBy('eo.expiry_date', 'DESC')
      .getMany();
  
    // Filter to get only the latest entry per email
    const latestByEmail = new Map<string, any>();
    emailOrders.forEach(order => {
      if (!latestByEmail.has(order.email)) {
        latestByEmail.set(order.email, {
          email: order.email,
          ipaddress: order.ipaddress,
        });
      }
    });
  
    return Array.from(latestByEmail.values());
  }
  
  

  async saveUserQuery(data: userQueryDTO): Promise<any> {
    const userQuery= new UserQuery()
    userQuery.name=data.name!
    userQuery.email=data.email!
    userQuery.message=data.message!
    userQuery.mobile=data.mobile!
    await userQuery.save()
  }

  async getPaymentStatusOfUserMail(userId: any,razorPayId:any): Promise<any> {
    const emailOrder = await EmailOrders.findOne({where:{user_id:userId,razorpay_order_id:razorPayId,payment_status:"paid"}})
    if(emailOrder){
      return true
    }
    return false
  }

  async forgetUserPassword(data: forgetDTO): Promise<any> {
    const user = await SystemUser.findOne({ where:{email:data.email} });
    if (!user) {
      throw new ApiError(404, 404, "User not found");
    }
    let tokenExist: SystemUser | null;
    let token: string;

    do {
    token = crypto.randomBytes(32).toString('hex');
    tokenExist = await SystemUser.findOne({ where: { resetPasswordToken: token } });
    } while (tokenExist); // Keep generating until we get a unique email
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

    user.resetPasswordToken = token;
    user.resetPasswordExpires = resetTokenExpiry.toString();
    await user.save();

    // Send email with reset link
    const resetUrl = `https://tempemailbox.com/reset-password/${token}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // const mailOptions = {
    //   to: user.email,
    //   from: process.env.EMAIL_USERNAME,
    //   subject: 'Password Reset',
    //   text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
    //     Please click on the following link, or paste this into your browser to complete the process:\n\n
    //     ${resetUrl}\n\n
    //     If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    // };

    const mailOptions = {
      to: user.email,
      from: `tempemailbox.com ${process.env.EMAIL_USERNAME}`,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Password Reset Request</h2>
          <p>You recently requested to reset your password for Your App Name.</p>
          <p>Please click the button below to reset your password:</p>
          <a href="${resetUrl}" 
             style="background-color: #2563eb; color: white; padding: 10px 20px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
             Reset Password
          </a>
          <p>If you didn't request this, please ignore this email.</p>
          <p style="font-size: 0.8em; color: #6b7280;">
            This link will expire in 1 hour.
          </p>
        </div>
      `,
      text: `Password Reset Link: ${resetUrl}`
    };

    await transporter.sendMail(mailOptions);
  }

  async resetUserPassword(token:string,data: resetDTO): Promise<any> {
    const user= await SystemUser.findOne({where:{resetPasswordToken:token}})
    if(isEmpty(user)){
      throw new ApiError(401, 401, "Password reset token is invalid or has expired");
    }
    const now = Date.now();
    const expiryTime = parseInt(user.resetPasswordExpires || '0');
    
    if (isNaN(expiryTime) || now > expiryTime) {
      // Clear expired token
      user.resetPasswordToken = "";
      user.resetPasswordExpires = "";
      await user.save();
      
      throw new ApiError(401, 401, "Password reset token has expired");
    }
    const hashedPassword = await bcrypt.hash(data.password!, 12);
    
    user.password = hashedPassword;
    user.resetPasswordToken = "";
    user.resetPasswordExpires = "";
    await user.save();
  }

  async userClickData(data: clickDTO): Promise<any> {
    const emailData= await EmailGenerator.findOne({where:{generated_email:data.temp_mail}})
    const clickedData= new UserClick()
    clickedData.temp_mail=data.temp_mail!
    clickedData.ipaddress=emailData?.ipaddress ? emailData?.ipaddress :"" 
    clickedData.expiration_date=emailData?.expiration_date ? emailData?.expiration_date :"" 
    await clickedData.save()
  }
  
  async sendEmailSubscription(): Promise<any> {
    const userClicks = await UserClick.find({});
    if (userClicks.length>0) {
      for(let res of userClicks){
        console.log(`>>>>>akakak`)
        const subscriptionUrl = `https://tempemailbox.com/login`;

        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
          },
        });
        const mailOptions = {
          to: res.temp_mail,
          from: `tempemailbox.com ${process.env.EMAIL_USERNAME}`,
          subject: 'Your Temporary Email is About to Expire – Renew Now!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">Your Temporary Email Will Expire Soon</h2>
              <p>Your temporary email <strong>${res.temp_mail}</strong> is set to expire on <strong>${res.expiration_date}</strong>.</p>
              <p>To keep using this email, please log in and extend your subscription.</p>
        
              <a href="${subscriptionUrl}" 
                 style="background-color: #2563eb; color: white; padding: 10px 20px; 
                        text-decoration: none; border-radius: 5px; display: inline-block;">
                 Renew Subscription
              </a>
        
              <h3 style="margin-top: 20px;">Why Go Premium?</h3>
              <ul style="line-height: 1.6;">
                <li><strong>Keep Your Email Alive:</strong> Don’t lose it after 7 days!</li>
                <li><strong>Unlimited Access:</strong> Continue using the same inbox without reset.</li>
                <li><strong>Full Inbox Access:</strong> See all mails, anytime.</li>
                <li><strong>Just ₹10/week:</strong> One of the lowest prices on the internet!</li>
              </ul>
        
              <p style="font-size: 0.8em; color: #6b7280; margin-top: 20px;">
                This reminder is sent to ensure you don’t lose access to your important mails.
              </p>
            </div>
          `,
          text: `
            Your temporary email (${res.temp_mail}) will expire on ${res.expiration_date}.
            Please login and take a subscription to continue using your inbox.
        
            Why Go Premium?
            - Keep Your Email Alive: Don’t lose it after 7 days!
            - Unlimited Access: Continue using the same inbox without reset.
            - Full Inbox Access: See all mails, anytime.
            - Just ₹10/week: One of the lowest prices on the internet!
        
            Renew now: ${subscriptionUrl}
          `
        };
        
    
    
        await transporter.sendMail(mailOptions);
      }
    }else{
      throw new ApiError(404, 404, "Users Clicks not found");
    }
  }

  async referToFriend(data: referDTO): Promise<any> {
   const referalByEmail = await EmailGenerator.findOne({ where: { generated_email: data.referal_by_email } });
   if(!referalByEmail){
    throw new ApiError(401, 401, "The Email Which You Want To Exceed Is Invalid");
   }
    const isUserAlreadyRefered= await Referal.find({where:{referal_to_email:data.referal_to_email}})
    if(isUserAlreadyRefered.length>0){
      throw new ApiError(401, 401, "This User Is Already Refered");
    }
    const disallowedDomain = 'tempemailbox.com';
    const emailDomain = data.referal_to_email?.split('@')[1];
  
    if (emailDomain === disallowedDomain) {
      throw new ApiError(400, 400, `Email addresses from ${disallowedDomain} are not allowed.`);
    }
    const referalData= new Referal()
    referalData.referal_by_email=data.referal_by_email!
    referalData.referal_to_email=data.referal_to_email!
    await referalData.save()
    const webUrl = `https://tempemailbox.com/signup`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    const mailOptions = {
      to: data.referal_to_email, // Email of the referred user
      from: `tempemailbox.com ${process.env.EMAIL_USERNAME}`,
      subject: 'You’ve Been Invited to Try tempemailbox.com – Claim Your Free Access!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">You've Been Referred!</h2>
          <p>Hey there 👋,</p>
          <p><strong>${data.referal_by_email}</strong> has invited you to try <strong>tempemailbox.com</strong> – the easiest way to get a free, disposable email address.</p>
          
          <p>As a referral bonus, you get <strong>extra days of premium access</strong> when you sign up using the link below:</p>
    
          <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong>Your Referral Link:</strong><br/>
            <a href="${webUrl}" style="color: #2563eb;">${webUrl}</a>
          </div>
    
          <p>✅ No signup required<br/>
             ✅ Instant email access<br/>
             ✅ Bonus rewards when you refer others too!</p>
    
          <p>Start using your temporary email now and enjoy a smoother, spam-free experience.</p>
    
          <p style="font-size: 0.85em; color: #6b7280; margin-top: 20px;">
            This referral is valid for a limited time. Don’t miss out!
          </p>
        </div>
      `,
      text: `
        You've Been Referred to tempemailbox.com!
    
        Hey there,
    
        ${data.referal_to_email} has invited you to try tempemailbox.com – a quick, no-hassle way to get temporary email addresses.
    
        Use this link to claim your free access:
        ${webUrl}
    
        ✅ No signup required
        ✅ Instant email access
        ✅ Bonus rewards when you refer others too!
    
        This referral is valid for a limited time. Start now and enjoy spam-free inboxing!
      `
    };

    await transporter.sendMail(mailOptions);
    
  }
  
  

}

// Export a singleton instance if desired
export default new UserService();
