import Joi from 'joi';

const allowedRoles = ['RETAILER', 'SALESMAN'];

const allowedCategories = ['CATEGORY 1', 'CATEGORY 2'];

// const loginUserSchema = Joi.object({
//   mobile: Joi.number()
//   .integer()
//   .min(6000000000)
//   .max(9999999999)
//   .required()
//   .messages({
//     'number.base': 'Mobile number must be a number',
//     'number.integer': 'Mobile number must be an integer',
//     'number.min': 'Invalid Mobile Number',
//     'number.max': 'Invalid Mobile Number',
//     'any.required': 'Mobile number is required'
//   }),
//   unique_code: Joi.string().optional(),

// });

const loginUserSchema = Joi.object({
  mobile: Joi.number()
  .integer()
  .min(6000000000)
  .max(9999999999)
  .required()
  .messages({
    'number.base': 'Mobile number must be a number',
    'number.integer': 'Mobile number must be an integer',
    'number.min': 'Invalid Mobile Number',
    'number.max': 'Invalid Mobile Number',
    'any.required': 'Mobile number is required'
  })
});

const verifyUserSchema = Joi.object({
  mobile: Joi.number()
  .integer()
  .min(6000000000)
  .max(9999999999)
  .required()
  .messages({
    'number.base': 'Mobile number must be a number',
    'number.integer': 'Mobile number must be an integer',
    'number.min': 'Invalid Mobile Number',
    'number.max': 'Invalid Mobile Number',
    'any.required': 'Mobile number is required'
  }),
  otp: Joi.string().required().messages({
    "string.base": "OTP must be a string.",
    "any.required": "OTP is required.",
  })
});


const registorRetailerSchema = Joi.object({
  mobile: Joi.number()
  .integer()
  .min(6000000000)
  .max(9999999999)
  .required()
  .messages({
    'number.base': 'Mobile number must be a number',
    'number.integer': 'Mobile number must be an integer',
    'number.min': 'Invalid Mobile Number',
    'number.max': 'Invalid Mobile Number',
    'any.required': 'Mobile number is required'
  }),
  userType: Joi.string().optional()
});

const profileRetailerSchema = Joi.object({
  name: Joi.string().required(),
  store_name: Joi.string().required(),  
  store_category: Joi.string().valid(...allowedCategories).required(),
});

const registorGameSchema = Joi.object({
  user_id: Joi.number(),
  user_source: Joi.string().optional(),
  unique_code: Joi.string().optional(),
  stick: Joi.string().optional()
});

const gameUniqueCodeVerificationSchema = Joi.object({
  unique_code: Joi.string().optional(),
});

const userDetailsSchema = Joi.object({
  name: Joi.string().optional(),
  state:Joi.string().optional(),
  district: Joi.string().optional(),
  total_wheat_acreages: Joi.number().optional(),
  language: Joi.string().optional(),
  selfie: Joi.string().optional()
});

const gameAttemptSchema = Joi.object({
  consumer_game_id: Joi.number().required(),
  attempt: Joi.number().required(),
  fullshot: Joi.string().required(),
});

const dataSchema = Joi.object({
  data: Joi.array().items(gameAttemptSchema).required(),
});

const consentSchema = Joi.object({
  is_consent:Joi.string().required()
})

const sfaIdSchema = Joi.string().required();

const cdrSchema = Joi.object({
  phone_number:Joi.string().optional().allow(null).allow(""),
  call_start_time:Joi.date().optional().allow(null).allow(""),
  call_answered_time:Joi.date().optional().allow(null).allow(""),
  call_end_time:Joi.date().optional().allow(null).allow(""),
  call_connect_status:Joi.string().optional().allow(null).allow(""),
  call_taklktime:Joi.string().optional().allow(null).allow(""),
  service_number:Joi.string().optional().allow(null).allow(""),
  age_consent_key_press:Joi.string().optional().allow(null).allow(""),
  campaign_lead_id:Joi.string().optional().allow(null).allow(""),
  brand_selection_keypress:Joi.string().optional().allow(null).allow(""),
  call_id:Joi.string().optional().allow(null).allow("")
})

const upiDetailsSchema = Joi.object({
  order_no:Joi.string().required(),
  previous_status:Joi.string().required(),
  current_status:Joi.string().required()
})

const quizSchema = Joi.object({
  session_id: Joi.string().optional(),
  question_id:Joi.number().optional(),
  answer: Joi.number().optional()
});

const ipAddressSchema = Joi.object({
  ipadress:Joi.string().required()
});

const deleteMailSchema = Joi.object({
  mail:Joi.string().required()
});

const userQuerySchema = Joi.object({
  email:Joi.string().required(),
  name:Joi.string().required(),
  message:Joi.string().required()
});

const ipadress = Joi.string().required()

const emailSchema = Joi.object({
  recipient: Joi.string().required(),
  from: Joi.string().required(),
  subject: Joi.string().required(),
  Date: Joi.string().required(),
  "body-html": Joi.string().required(), // Enclosed in quotes
});

const orderSchema = Joi.object({
  email:Joi.string().required(),
  days:Joi.number().required(),
  amount:Joi.number().required(),
  expiry_date:Joi.string().required()
});

const signupSchema = Joi.object({
  email:Joi.string().required(),
  password:Joi.string().required()
});
export { ipAddressSchema,signupSchema,userQuerySchema,ipadress,deleteMailSchema,emailSchema,loginUserSchema, verifyUserSchema, registorRetailerSchema,profileRetailerSchema,registorGameSchema,gameUniqueCodeVerificationSchema ,userDetailsSchema,dataSchema, consentSchema,gameAttemptSchema,sfaIdSchema,cdrSchema,upiDetailsSchema,quizSchema,orderSchema}
