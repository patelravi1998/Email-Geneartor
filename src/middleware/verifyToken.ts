import { RequestHandler } from 'express';
import jwt, { JwtPayload, TokenExpiredError } from 'jsonwebtoken';
import dotenv from "dotenv";
// import logger from '../utils/logger';
import { ApiError } from './errors';
dotenv.config();

const authMiddleware: RequestHandler = async (req, res, next) => {
    try {
        const bearerHeader = req.headers['authorization'];

        if (typeof bearerHeader !== 'undefined') {
            const bearerToken = bearerHeader.split(' ')[1];
            const decoded = jwt.verify(bearerToken, process.env.JWT_SECRET as string) as JwtPayload;
            req.user = decoded;
            console.log(`>>>>user${JSON.stringify(req.user)}`)
            next();
        } else {
            throw new ApiError(401, 401, "Unauthorized access");
        }
    } catch (error) {
        if (error instanceof TokenExpiredError) {
            next(new ApiError(401, 401, "Token has expired"));
        } else if (error instanceof jwt.JsonWebTokenError) {
            next(new ApiError(401, 401, "Invalid token"));
        } else {
            next(error);
        }
    }
};

export { authMiddleware };
