// src/dtos/UserDTO.ts

import Joi from 'joi';

export class loginUserDTO {
  mobile?: bigint;
}

export class verifyOtpDTO {
  mobile?: bigint;
  otp?: string;
}

// export class verifyOtpDTO {
//   mobile?: bigint;
//   otp?: string;
//   longitude?: string;
//   latitude?: string;
//   IPAddress?: string;
// }

export class verifyRetailerDTO {
  mobile_number?: string;
  constructor(mobile_number: string) {
    this.mobile_number = mobile_number;
  }
}

export class RegistorRetailerDTO {
  mobile?: bigint;
}



export class UpdateUserDTO {
  id?:string;
  name?:string;
  store_name?: string;
  dob?: string;
}

export class ConsumerGameDTO {
  user_id?: bigint;
  user_source?: string;
  unique_code?: string;
  stick?: string
}

export class UpdateUserDetailsDTO {
  name?: string;
  state?:string;
  district?: string;
  language?: string;
  selfie?: string
  total_wheat_acreages?:bigint
}  

export class  UserUpiDetails {
  userId?: bigint;
  name?: string;
  email?: string;
  mobileNo?: string;
  upiId?: string;
  amount?: number;
  consumerGameId?:number;
}


export class  changeUpiStatus {
  order_no?: string;
  previous_status?: string;
  current_status?: string;
}

export class  quizDtos {
  session_id?: string;
  question_id?: number;
  answer?: number;
}

export class  ipAddressDTO {
  ipadress?: string;
}

export class EmailDTO {
  recipient?: string;
  from?: string;
  subject?: string;
  Date?: string;
  ["body-html"]?: string;
}