import { registerPhoneService,registerEmailService,registerPinService } from "../services/registerUser.service.js";


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

// New controller for registering email and name

export const registerEmail = async (req, res) => {
  try {
    const { email, name, session_token } = req.body;
    const result = await registerEmailService(email, name, session_token);
    res.status(result.status || 200).json({
      message: result.message,
      session_token: result.session_token,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const registerPin = async (req, res) => {
  try {
    const { pin, session_token } = req.body;
    const result = await registerPinService(pin, session_token);
    res.status(result.status || 200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};