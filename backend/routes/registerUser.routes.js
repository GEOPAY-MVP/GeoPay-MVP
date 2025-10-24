import express from "express";
import { upload } from "../middleware/upload.js";
import { registerPhone,registerEmail,registerPin,registerCnic } from "../controllers/registerUser.controller.js";

const router = express.Router();

router.post("/register-phone", registerPhone);
router.post("/register-email", registerEmail);
router.post("/register-pin", registerPin);
router.post("/register-cnic", upload.single("cnic_image"), registerCnic);


export default router;
