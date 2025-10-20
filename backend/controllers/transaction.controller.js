import { getFilteredTransactions } from "../services/transaction.service.js";

export const fetchTransactions = async (req, res) => {
  try {
    // Temporary hardcoded userId (until auth is added)
    const userId = "11111111-1111-1111-1111-111111111111";

    const transactions = await getFilteredTransactions(userId, req.query);
    res.json({ success: true, data: transactions });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
