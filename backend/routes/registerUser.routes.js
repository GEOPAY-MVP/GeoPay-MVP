import express from "express";
import { registerPhone } from "../controllers/registerUser.controller.js";

const router = express.Router();

// POST /users/register-phone
router.post("/", registerPhone);

export default router;
