import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export const generateTransactionId = () => {
    const prefix = "ALMTESTQC";
    
    // Get the current date and time in "YYMMDDHHMMSS" format
    const now = new Date();
    const year = String(now.getFullYear()).slice(2); // last two digits of the year
    const month = String(now.getMonth() + 1).padStart(2, '0'); // months are zero-based
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const dateTimePart = `${year}${month}${day}${hours}${minutes}${seconds}`;
    
    // Generate a random 6-digit number
    const randomPart = Math.floor(100000 + Math.random() * 900000).toString();

    const sufix = "KOUNTER";

    return `${prefix}${dateTimePart}${randomPart}${sufix}`;
}

export const generateHmacKey = (
    type: string,
    name: string,
    msisdn: string,
    annotation: {
        couponId: string,
        couponCode: string | undefined,
        couponPin: any,
    },
    sku: string| undefined,
    amount: any,
    transaction_id: string,
): string => {
    const key = 'almondRewards';
    const body = {
       type: type,
    name: name,
    msisdn: msisdn,
    annotation: {
        couponId: annotation.couponId, 
        couponCode: annotation.couponCode,
        couponPin: annotation.couponPin
    },
    sku: sku,
    amount: amount,
    transaction_id: transaction_id,
    };

    const requestBody = JSON.stringify(body); // Convert the body to a JSON string
 
    // Create an HMAC-SHA256 hash
    const hmac = crypto.createHmac('sha256', key);
 
    // Update the hash with the request body
    hmac.update(requestBody);
 
    // Generate the HMAC-SHA256 digest in hexadecimal format
    const hmacHex = hmac.digest('hex');
 
    console.log("HMAC-SHA256:", hmacHex);
    return hmacHex;
};
