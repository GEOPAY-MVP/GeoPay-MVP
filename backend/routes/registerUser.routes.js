import express from "express";
import { registerPhone,registerEmail,registerPin } from "../controllers/registerUser.controller.js";

const router = express.Router();

router.post("/register-phone", registerPhone);
router.post("/register-email", registerEmail);
router.post("/register-pin", registerPin);


export default router;
