import prisma from "../prisma.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import bcrypt from "bcryptjs";
// In-memory store for temporary sessions
const registrationSessions = new Map();



const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey"; 

/**
 * Step 1: Register phone number
 */

export const registerPhoneService = async (phone) => {
  if (!phone) throw new Error("Phone number is required");

  const existingUser = await prisma.user.findUnique({
    where: { phone_number: phone },
  });

  if (existingUser) {
    return { message: "Phone number already registered" };
  }

  const sessionToken = crypto.randomBytes(16).toString("hex");

  // Store session temporarily
  registrationSessions.set(sessionToken, { phone });

  return {
    message: "Registration started. Please provide email and name.",
    session_token: sessionToken,
  };
};

/**
 * Step 2: Register email and name
 */
export const registerEmailService = async (email, name, sessionToken) => {
  if (!email || !name || !sessionToken) {
    return {
      status: 400,
      message: "Invalid email, name, or session token",
    };
  }

  // Verify session token
  const sessionData = registrationSessions.get(sessionToken);
  if (!sessionData) {
    return {
      status: 401,
      message: "Invalid session token",
    };
  }

  // Check if email already exists
  const existingEmail = await prisma.user.findUnique({
    where: { email },
  });

  if (existingEmail) {
    return {
      status: 409,
      message: "Email already registered",
    };
  }

  // Generate next session token for step 3
  const nextSessionToken = crypto.randomBytes(16).toString("hex");

  // Update session data
  registrationSessions.set(nextSessionToken, {
    ...sessionData,
    email,
    name,
  });

  // Remove old session token
  registrationSessions.delete(sessionToken);

  return {
    status: 201,
    message: "Email and name registered. Please set transaction PIN.",
    session_token: nextSessionToken,
  };
};


/**
 * Step 3: Register transaction PIN
 * (Stores hashed PIN temporarily — user not created yet)
 */
export const registerPinService = async (pin, sessionToken) => {
  if (!pin || !sessionToken) {
    return { status: 400, message: "Invalid PIN or session token" };
  }

  const sessionData = registrationSessions.get(sessionToken);
  if (!sessionData) {
    return { status: 401, message: "Invalid session token" };
  }

  // Hash the PIN before 

  const nextSessionToken = crypto.randomBytes(16).toString("hex");

  registrationSessions.set(nextSessionToken, {
    ...sessionData,
    pin: pin,
  });

  // Remove old token
  registrationSessions.delete(sessionToken);

  return {
   
    message: "PIN created successfully. Please upload CNIC.",
    session_token: nextSessionToken,
  };
};


/*
 * Step 4: Register CNIC
 * (Uploads CNIC image → Calls Python OCR API → Extracts data → Creates user)
 */
export const registerCnicService = async (sessionToken, cnicImagePath) => {
  if (!sessionToken || !cnicImagePath) {
    return { status: 400, message: "Missing session token or CNIC image" };
  }

  const sessionData = registrationSessions.get(sessionToken);
  if (!sessionData) {
    return { status: 401, message: "Invalid session token" };
  }

  try {
    // 1️⃣ Prepare image for Python API
    const formData = new FormData();
    formData.append("file", fs.createReadStream(cnicImagePath)); // ✅ field must be 'file'

    // 2️⃣ Call Python OCR API
    const response = await axios.post("http://127.0.0.1:8000/extract-cnic/", formData, {
      headers: formData.getHeaders(),
    });

    const ocrData = response.data.data;

    // 3️⃣ Validate OCR data
    if (!ocrData?.CNIC || !ocrData?.Name) {
      return { status: 400, message: "Invalid CNIC image or OCR failed" };
    }

    // 4️⃣ Check if CNIC already registered
    const existingUser = await prisma.user.findUnique({
      where: { cnic: ocrData.CNIC },
    });
    if (existingUser) {
      return { status: 409, message: "CNIC already registered" };
    }
    const dummyHash = await bcrypt.hash("temporary_password", 10);
    // 5️⃣ Create user in DB
    const newUser = await prisma.user.create({
      data: {
        full_name: sessionData.name || ocrData.Name,
        email: sessionData.email,
        phone_number: sessionData.phone,
        pin: sessionData.pin,
        cnic: ocrData.CNIC,
        date_of_birth: ocrData["Date of Birth"]
          ? new Date(ocrData["Date of Birth"])
          : null,
        kyc_status: "pending",
        status: "active",
        password_hash: dummyHash, // Temporary password
      },
    });

    // 6️⃣ Generate JWT for the user
    const token = jwt.sign(
      { user_id: newUser.user_id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 7️⃣ Cleanup & remove session
    registrationSessions.delete(sessionToken);
    fs.unlinkSync(cnicImagePath);

    // ✅ Success response
    return {
      status: 201,
      message: "CNIC registered. Please complete biometric verification.",
      data: {
        user_id: newUser.user_id,
        full_name: newUser.full_name,
        cnic: newUser.cnic,
        date_of_birth: newUser.date_of_birth,
        kyc_status: newUser.kyc_status,
        token,
      },
    };
  } catch (error) {
    console.error("Error processing CNIC:", error.message);
    return {
      status: 500,
      message: "OCR processing failed",
      error: error.message,
    };
  }
};