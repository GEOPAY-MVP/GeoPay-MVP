import prisma from "../prisma.js";
import crypto from "crypto";

// In-memory store for temporary sessions
const registrationSessions = new Map();

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