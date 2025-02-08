// src/controllers/UserController.ts

import logger from "../utils/logger"; // Adjust path as needed
import { Request, Response, NextFunction } from "express";
import UserService from "../services/UserService";
import { ApiError } from "../middleware/errors";

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
        await UserService.whatsaAppMessageSent(mobile, name, certificateResult);

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
