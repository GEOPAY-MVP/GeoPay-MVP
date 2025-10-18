import prisma from "../prisma.js";

export const getFilteredTransactions = async (userId, filters) => {
  const { type, status, search, startDate, endDate } = filters;

  const wallet = await prisma.wallet.findUnique({
    where: { userId },
  });

  if (!wallet) throw new Error("Wallet not found for this user");

  // Base condition: transactions involving this user's wallet
  const baseCondition = {
    OR: [
      { senderWalletId: wallet.id },
      { receiverWalletId: wallet.id },
    ],
  };

  // Combine with filters using AND
  const where = {
    AND: [baseCondition],
  };

  if (type) where.AND.push({ type });
  if (status) where.AND.push({ status });
  if (startDate || endDate)
    where.AND.push({
      createdAt: {
        gte: startDate ? new Date(startDate) : undefined,
        lte: endDate ? new Date(endDate) : undefined,
      },
    });

  if (search)
    where.AND.push({
      description: { contains: search, mode: "insensitive" },
    });

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      senderWallet: { select: { id: true, userId: true } },
      receiverWallet: { select: { id: true, userId: true } },
    },
  });

  return transactions;
};
