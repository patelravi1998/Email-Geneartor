import Joi from 'joi';


const gameUniqueCodeVerificationSchema = Joi.object({
    unique_code: Joi.string().optional(),
    id:Joi.number().optional()
});

export {gameUniqueCodeVerificationSchema}