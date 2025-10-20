
import express from "express";
import transactionRoutes from "./routes/transaction.routes.js";

const app = express();
app.use(express.json());

app.use("/wallet/transactions", transactionRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
