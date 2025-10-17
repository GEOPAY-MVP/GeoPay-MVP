import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * Finds a wallet by the user's ID.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<import('@prisma/client').Wallet | null>} The wallet object or null if not found.
 */
export const findWalletByUserId = async (userId) => {
  return prisma.wallet.findUnique({
    where: { userId },
  });
};

/**
 * Creates a new wallet for a given user.
 * This function is designed to be used within a transaction.
 * @param {string} userId - The ID of the user to create a wallet for.
 * @param {object} tx - The Prisma transaction client.
 * @returns {Promise<import('@prisma/client').Wallet>} The created wallet.
 */
export const createWallet = async (userId, tx) => {
  // We must use the 'tx' (transaction client) passed from
  // the user registration service to ensure the operation is atomic.
  if (!tx) {
    throw new Error('createWallet must be used within a transaction.');
  }
  
  return tx.wallet.create({
    data: {
      userId: userId,
      // All other fields (balance, status, etc.)
      // will use the default values from your schema.
    },
  });
};