import prisma from "../prisma.js";

export const getFilteredTransactions = async (userId, filters) => {
  const {
    type,
    status,
    search,
    start_date,
    end_date,
    page = 1,
    limit = 20,
  } = filters;

  //  Find wallet for this user
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
  });

  if (!wallet) throw new Error("Wallet not found for this user");

  // Base condition
  const baseCondition = {
    OR: [
      { senderWalletId: wallet.id },
      { receiverWalletId: wallet.id },
    ],
  };

  // Build filters
  const where = {
    AND: [baseCondition],
  };

  if (type) where.AND.push({ type });
  if (status) where.AND.push({ status });
  if (start_date || end_date)
    where.AND.push({
      createdAt: {
        gte: start_date ? new Date(start_date) : undefined,
        lte: end_date ? new Date(end_date) : undefined,
      },
    });

  if (search)
    where.AND.push({
      OR: [
        { receiverName: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { id: { contains: search, mode: "insensitive" } },
      ],
    });

  //  Pagination setup
  const skip = (page - 1) * limit;
  const take = parseInt(limit, 10);

  //  Fetch data and total count
  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        senderWallet: { select: { id: true, userId: true } },
        receiverWallet: { select: { id: true, userId: true } },
      },
    }),
    prisma.transaction.count({ where }),
  ]);

  //  Format response
  const formattedTransactions = transactions.map((txn) => ({
    transaction_id: txn.id,
    transaction_type: txn.type,
    amount: Number(txn.amount),
    receiver_name: txn.receiverName,
    description: txn.description,
    status: txn.status,
    created_at: txn.createdAt,
    completed_at: txn.completedAt,
  }));

  return {
    transactions: formattedTransactions,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
  };
};
