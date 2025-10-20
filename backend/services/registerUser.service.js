import prisma from "../prisma.js";
import crypto from "crypto";

/**
 * Step 1: Check if phone exists
 * Step 2: Return appropriate response data
 */
export const registerPhoneService = async (phone) => {
  if (!phone) {
    throw new Error("Phone number is required");
  }

  //  Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { phone_number: phone },
  });

  if (existingUser) {
    return {
      message: "Phone number already registered",
    };
  }

  //  Generate temporary session token
  const sessionToken = crypto.randomBytes(16).toString("hex");

  return {
    message: "Registration started. Please provide email and name.",
    session_token: sessionToken,
  };
};
