// src/routes/users.ts

import express from "express";
import UserController from "../controllers/UserController";
import { authMiddleware } from "../middleware/verifyToken";

const router = express.Router();

router.post("/generate_certificate", UserController.genearteCertificate);

export default router;
