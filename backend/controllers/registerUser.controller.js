import { registerPhoneService } from "../services/registerUser.service.js";

export const registerPhone = async (req, res) => {
  try {
    const { phone } = req.body;

    const response = await registerPhoneService(phone);

    return res.status(200).json(response);
  } catch (error) {
    console.error(" Error in registerPhone controller:", error.message);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};
