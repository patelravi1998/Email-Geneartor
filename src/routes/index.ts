// src/routes/index.ts

import express from "express";
import userRoutes from "./users";

const router = express.Router();

// Mount user routes
router.use("/users", userRoutes);
// Add more route modules as needed

export default router;
