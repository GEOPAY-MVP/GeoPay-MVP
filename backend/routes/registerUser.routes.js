import express from "express";
import { registerPhone,registerEmail } from "../controllers/registerUser.controller.js";

const router = express.Router();

router.post("/register-phone", registerPhone);
router.post("/register-email", registerEmail);

export default router;
