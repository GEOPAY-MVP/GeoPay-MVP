// backend/controllers/wallet.controller.js

// Import the specific function from your service
import { getWalletByUserId } from '../services/wallet.service.js';

/**
 * Get the logged-in user's wallet.
 * Assumes 'auth.middleware.js' has run and attached the user to req.user
 */
const getWallet = async (req, res, next) => {
  try {
    // Change this to match your middleware:
    const userId = req.user.user_id; // <-- CHANGED (was req.user.userId)

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated.' });
    }

    const wallet = await getWalletByUserId(userId);

    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found.' });
    }

    res.status(200).json(wallet);
  } catch (error) {
    next(error);
  }
};

export const walletController = {
  getWallet,
};