// backend/routes/wallet.routes.js

import express from 'express';
import { getWallet } from '../controllers/wallet.controller.js';

// Import your authentication middleware
// Based on your screenshot, it's in the 'middleware' folder.
// I'm assuming the exported function is named 'protect'.
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * GET /api/wallet
 * (Assuming this file is mounted in app.js as '/api/wallet')
 *
 * This route is protected. The 'protect' middleware will run first.
 * If authentication is successful, it passes control to 'walletController.getWallet'.
 */
router.get('/', authenticateToken, getWallet);


export default router;