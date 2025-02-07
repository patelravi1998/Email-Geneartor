import { verifyOtpDTO,UserUpiDetails } from "src/dtos/user/UserDTO";
import { LoginHistories,UpiTransaction,ConsumerGames,RetailerUniqueCode } from "../entities";
import UserService from "../services/UserService";
// import { User } from "../entities";
import axios from "axios";
import { ApiError } from '../middleware/errors';
import AuthService from "../services/AuthService";
import * as crypto from 'crypto';
import { In } from 'typeorm';
import { randomBytes } from 'crypto';



export const generateRandomString = (length: number): string => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  export const otpCodeGenerate = async (mobile: bigint): Promise<number | any> => {
    console.log(`>>>>>>>>fafaf`)
    // let name: string | null = null;
    let msg: string;
  
    let otp = Math.floor(1000 + Math.random() * 9000);
  
    try {  

      const user = await UserService.getUserByMobile(mobile,1);
      console.log(`>>>>>>user${JSON.stringify(user)}`)
      // console.log("user.name",user?.name)
      if (user) {
        // name = await textTruncate(user?.name as string, 26, "...");
        msg = `Your OTP is ${otp}. -Atechnos`;
      } else {
        msg = `Your OTP is ${otp}. -Atechnos`;
      }
      console.log(`>>>>>>>>ooooo`,otp)
  
      const url = `http://125.16.147.178/VoicenSMS/webresources/CreateSMSCampaignGet?ukey=KTXq25wGcHqv6xcnGjl9UnAWK&msisdn=${mobile}&language=0&credittype=2&senderid=ATCHNS&templateid=0&message=${msg}&filetype=2`;
  
      console.log(url);
      const options = {
        method: "GET",
        url: url,
      };
  
      // if ((process.env.NODE_ENV === 'PRODUCTION')) {
        axios(options);
      // }
      console.log("ooooooooootrttt",otp)
      return otp;
    } catch (error) {
      console.error("errorhhhhhhhhhhhhh");
      return null;
    }
  };

  export const textTruncate = async (str: string, length: number = 50, ending: string = '...'): Promise<string> => {
    if (str.length > length) {
      return str.substring(0, length - ending.length) + ending;
    } else {
      return str;
    }
  };

  export const sendSMS = async (sms:any,number:any): Promise<any> => {
    const message = encodeURIComponent(sms); // URL encode the message to avoid breaking the query string
    const apiUrl = `http://125.16.147.178/VoicenSMS/webresources/CreateSMSCampaignGet?ukey=KTXq25wGcHqv6xcnGjl9UnAWK&msisdn=${number}&language=0&credittype=8&senderid=ALMNDS&templateid=0&message=${message}&filetype=2`;
    try {
        const response = await axios.get(apiUrl);
        console.log("SMS API Response:", response.data);
    } catch (error) {
        console.error("SMS API Error:", error);
        throw new ApiError(400, 400, "Failed to send SMS");
    }
  }


  // export const verifyOtpFunction = async (otpData: verifyOtpDTO): Promise<any> => {
  //   console.log(otpData);

  //   if (!otpData.mobile) {
  //     throw new ApiError(400,400, 'Mobile number is required');
  //   }
  
  //   let userData = await AuthService.findUserByMobile(otpData.mobile);
  
  //   if (userData) {
  //     if (userData.otp === otpData.otp || otpData.otp === "20241") {
  //       userData.otp = null;
  //       await userData.save();
  //       console.log('userData', userData);
  
  //       const loginHistory = await AuthService.createLoginHistory(userData, otpData);
  //       console.log("loginHistory", loginHistory);
  
  //       return userData;
  //     }
  //   } else {
  //     return null;
  //   }
  // };
  
  // Add more utility functions as needed

  function generateSecretKey (userDetails: UserUpiDetails,transactionId:string)  {
    let body = {
      type: 'upi',
      name:userDetails. name,
      email: userDetails.email,
      msisdn: userDetails.mobileNo,
      upi_id: userDetails.upiId,
      amount: userDetails.amount,
      transaction_id:transactionId,
      sku:"APC003T0001U"
    };

    const requestBody = JSON.stringify(body); // Convert req.body to a string (adjust as needed)

    // Create an HMAC-SHA256 hash
    const hmac = crypto.createHmac('sha256', "almondRewards");

    // Update the hash with the request body
    hmac.update(requestBody);

    // Generate the HMAC-SHA256 digest in hexadecimal format
    const hmacHex = hmac.digest('hex');

    console.log("HMAC-SHA256:", hmacHex);
    return hmacHex;
  }

  function generateUniqueRefCode() {
    const currentDate = new Date();
    const yy = currentDate.getFullYear().toString().slice(-2);
    const mm = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const dd = currentDate.getDate().toString().padStart(2, '0');
    const min = Math.pow(10, 12);
    const max = Math.pow(10, 13) - 1;
    const range = max - min + 1;
    const random_number = Math.floor(Math.random() * range) + min
    console.log(`>>>>>>`,`PUNJAB${yy}${mm}${dd}${random_number.toString().padStart(13 - 6, '0')}`)
    return `PUNJAB${yy}${mm}${dd}${random_number.toString().padStart(13 - 6, '0')}`;
  }

  export async function processUpiTransaction(userDetails: UserUpiDetails) {
    const transactionId= "Almond" + generateUniqueRefCode()
      const headers = {
        'x-hmac': generateSecretKey(userDetails,transactionId),
        'permanent_token': 'dce352be62814e2665d8bd839b04a857c274a6909e3e2a2c7c2a38827c237a7c59f1d493bbcf915956578fa6bbaf1870b2ed88d8fd106c4509b5075e5f09af4a2109050477f089be23c357c468df3a07'
    };
    try {
    const response = await axios.post('https://rewards.almonds.ai/gratification', {
      type: 'upi',
      name: userDetails.name,
      email: userDetails.email,
      msisdn: userDetails.mobileNo,
      upi_id: userDetails.upiId,
      amount: userDetails.amount,
      transaction_id: transactionId,
      sku:"APC003T0001U"
  }, { headers });


        const apiData = response.data;


        if (apiData.status && apiData.statusCode === 200) {
            // Success case - Insert into UpiTransaction table
            const upiTransaction = new UpiTransaction();
            upiTransaction.user_id = userDetails.userId!;
            upiTransaction.name = userDetails.name!;
            upiTransaction.mobile_no = userDetails.mobileNo!;
            upiTransaction.amount = userDetails.amount!;
            upiTransaction.status = apiData.data.status; // e.g. "success"
            upiTransaction.transaction_id = transactionId;
            upiTransaction.message = apiData.data.message;
            upiTransaction.transaction_time = new Date();
            upiTransaction.consumer_game_id = userDetails.consumerGameId!;
            upiTransaction.upi_id = userDetails.upiId!;
            await upiTransaction.save();

            return { success: true, message: apiData.data.message };
        } else {
            throw new ApiError(400, 400, apiData.message || 'Transaction failed');
        }
    } catch (error:any) {
      console.log( error )
        // Error case - Insert the failed transaction details
        const upiTransaction = new UpiTransaction();
        upiTransaction.user_id = userDetails.userId!;
        upiTransaction.name = userDetails.name!;
        upiTransaction.mobile_no = userDetails.mobileNo!;
        upiTransaction.amount = userDetails.amount!;
        upiTransaction.status = 'failed';
        upiTransaction.transaction_id = transactionId;
        upiTransaction.message = error.response?.data?.message || 'Failed to process UPI transaction';
        upiTransaction.transaction_time = new Date();
        upiTransaction.consumer_game_id = userDetails.consumerGameId!;
        upiTransaction.upi_id = userDetails.upiId!;
        await upiTransaction.save();

        throw new ApiError(400, 400, error.response?.data?.message || 'Failed to process UPI transaction');
    }
}


export async function sendSmsAndUpiToRetailer (qrCode:string,userId:bigint){
  const toatalUsers = await ConsumerGames.createQueryBuilder('consumer_games')
  .select('consumer_games.user_id')
  .where('consumer_games.qr_code = :qrCode', { qrCode })
  .andWhere('consumer_games.is_retailer_gratified = 0')
  .andWhere(qb => {
    const subQuery = qb.subQuery()
      .select('1')
      .from(ConsumerGames, 'subGames')
      .where('subGames.user_id = consumer_games.user_id')
      .andWhere('subGames.is_retailer_gratified = 1')
      .getQuery();
    return `NOT EXISTS (${subQuery})`;
  })
  .distinct(true)
  .getMany();

const distinctUserCount = toatalUsers.length;

console.log('distinctUserCount:', distinctUserCount);

  if(toatalUsers.length>0){

      const retailerUniqueCodeData= await RetailerUniqueCode.findOne({where:{unique_code:qrCode,status:1}})

      let retailerTotalGratifiedUser =retailerUniqueCodeData ? retailerUniqueCodeData?.total_user_gratified : 0

      let noOfUsers = distinctUserCount + retailerTotalGratifiedUser!;
      console.log("noOfUsers",noOfUsers);

      let sendMessage=""
      if(retailerUniqueCodeData){
      const retailerData= await UserService.getUserProfileById(retailerUniqueCodeData.user_id)
      if(retailerData){
            if(Number(noOfUsers)===1){//1
              sendMessage="Mubarak ho! Apke QR dwara 1 customer nai participate kar lia hai. Apne jeete hai Rs 10 ka cashback. Jyada jeete ke liye aur customers ko participate karaye.-Almonds"
              await sendSMS(sendMessage,retailerData.mobile);
              await processUpiTransaction({
                userId: retailerData.id, 
                name: retailerData?.name, 
                email: '', 
                mobileNo: (retailerData?.mobile)?.toString(), 
                upiId: retailerData?.upi_id, 
                amount: process.env.NODE_ENV==="DEVELOPMENT" ? 1 : 10,
                consumerGameId:0
              });
            }
            else if(Number(noOfUsers)===5){ //5
                sendMessage="Mubarak ho! Apke QR dwara total 5 customers nai participate kar lia hai. Apne jeete hai Rs 15 ka cashback. Iss offer main apki total jeeti hui rashi Rs 25 ho gai hai. Jyada jeete ke liye aur customers ko participate karaye.-Almonds"
                await sendSMS(sendMessage,retailerData.mobile);
                await processUpiTransaction({
                  userId: retailerData.id, 
                  name: retailerData?.name, 
                  email: '', 
                  mobileNo: (retailerData?.mobile)?.toString(), 
                  upiId: retailerData?.upi_id, 
                  amount: process.env.NODE_ENV==="DEVELOPMENT" ? 1 : 15,
                  consumerGameId:0
                });

            }else if(Number(noOfUsers)===10){//10
                sendMessage="Mubarak ho! Apke QR dwara total 10 customers nai participate kar lia hai. Apne jeete hai Rs 75 ka cashback. Iss offer main apki total jeeti hui rashi Rs 100 ho gai hai. Jyada jeete ke liye aur customers ko participate karaye.-Almonds"
                sendSMS(sendMessage,retailerData.mobile);
                await processUpiTransaction({
                  userId: retailerData.id, 
                  name: retailerData?.name, 
                  email: '', 
                  mobileNo: (retailerData?.mobile)?.toString(), 
                  upiId: retailerData?.upi_id, 
                  amount: process.env.NODE_ENV==="DEVELOPMENT" ? 1 : 75,
                  consumerGameId:0
                });
            }else if(Number(noOfUsers)===20){//20
                sendMessage="Mubarak ho! Apke QR dwara total 20 customers nai participate kar lia hai. Apne jeete hai Rs 100 ka cashback. Iss offer main apki total jeeti hui rashi Rs 200 ho gai hai. Jyada jeete ke liye aur customers ko participate karaye. -Almonds"
                sendSMS(sendMessage,retailerData.mobile);
                await processUpiTransaction({
                  userId: retailerData.id, 
                  name: retailerData?.name, 
                  email: '', 
                  mobileNo: (retailerData?.mobile)?.toString(), 
                  upiId: retailerData?.upi_id, 
                  amount:process.env.NODE_ENV==="DEVELOPMENT" ? 1 : 100,
                  consumerGameId:0
                });
            }else if(Number(noOfUsers)===50){//50
                sendMessage="Mubarak ho! Apke QR dwara total 50 customers nai participate kar lia hai. Apne jeete hai Rs 250 ka cashback. Iss offer main apki total jeeti hui rashi Rs 450 ho gai hai. Shukriya. -Almonds"
                sendSMS(sendMessage,retailerData.mobile);
                await processUpiTransaction({
                  userId: retailerData.id, 
                  name: retailerData?.name, 
                  email: '', 
                  mobileNo: (retailerData?.mobile)?.toString(), 
                  upiId: retailerData?.upi_id, 
                  amount:process.env.NODE_ENV==="DEVELOPMENT" ? 1 : 250,
                  consumerGameId:0
                });
            }
        }

      }

      await ConsumerGames.update(
        {
          gift: In(['PHYSICAL', 'DIGITAL']),
          is_retailer_gratified: 0,
          qr_code: qrCode
        },
        {
          is_retailer_gratified: 1
        }
      );
      retailerUniqueCodeData!.total_user_gratified = Number(noOfUsers);

      await retailerUniqueCodeData?.save()
  }




}

export function generateSessionId(): string {
  return randomBytes(16).toString('hex'); // Generates a 32-character hexadecimal string
}
  