// src/controllers/UserController.ts

import logger from "../utils/logger"; // Adjust path as needed
import { Request, Response, NextFunction } from "express";
import UserService from "../services/UserService";
import {
  userDetailsSchema,
  sfaIdSchema,
  upiDetailsSchema,
  quizSchema,
} from "../validations/userDTO"; // Import UserResponseDTO
import { ApiError } from "../middleware/errors";
import { includes, isEmpty } from "lodash";
import { sendSMS } from "../utils/utils";
import { changeUpiStatus } from "../dtos/user/UserDTO";
import formidable from "formidable";
import fs from "node:fs";
import PublicService from "../services/PublicService";

export class UserController {
  async genearteCertificate(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const { mobile, name, designation } = req.body;

      const certificateResult = await UserService.generateUserCertificate(
        mobile,
        name,
        designation
      );
      if (certificateResult) {
        res.sendSuccess(
          200,
          "Certifcate Generated Successfully",
          certificateResult
        );
      } else {
        throw new ApiError(400, 400, "Failed To Generate Certificate");
      }
    } catch (error) {
      next(error);
    }
  }
}

// Export a singleton instance if desired
export default new UserController();
