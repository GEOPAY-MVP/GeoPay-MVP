import express from "express";
import { fetchTransactions } from "../controllers/transaction.controller.js";

const router = express.Router();

// Example: GET /api/transactions?status=completed&type=transfer&search=bill
router.get("/", fetchTransactions);

export default router;
