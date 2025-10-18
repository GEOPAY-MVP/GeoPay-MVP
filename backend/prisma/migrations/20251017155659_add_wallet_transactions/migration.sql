-- CreateEnum
CREATE TYPE "WalletStatus" AS ENUM ('active', 'frozen', 'suspended', 'closed');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('transfer', 'payment', 'topup', 'bill_payment', 'withdrawal', 'deposit', 'refund');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled', 'reversed');

-- AlterTable
ALTER TABLE "user_device" ALTER COLUMN "registered_at" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "wallet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currencyCode" VARCHAR(3) NOT NULL DEFAULT 'PKR',
    "availableBalance" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "pendingBalance" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "status" "WalletStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction" (
    "id" TEXT NOT NULL,
    "senderWalletId" TEXT NOT NULL,
    "receiverWalletId" TEXT,
    "receiverName" TEXT,
    "type" "TransactionType" NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "currencyCode" VARCHAR(3) NOT NULL DEFAULT 'PKR',
    "status" "TransactionStatus" NOT NULL DEFAULT 'pending',
    "description" TEXT,
    "provider" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "wallet_userId_key" ON "wallet"("userId");

-- CreateIndex
CREATE INDEX "idx_wallet_user" ON "wallet"("userId");

-- CreateIndex
CREATE INDEX "idx_wallet_status" ON "wallet"("status");

-- CreateIndex
CREATE INDEX "idx_transaction_sender_wallet" ON "transaction"("senderWalletId");

-- CreateIndex
CREATE INDEX "idx_transaction_receiver_wallet" ON "transaction"("receiverWalletId");

-- CreateIndex
CREATE INDEX "idx_transaction_type" ON "transaction"("type");

-- CreateIndex
CREATE INDEX "idx_transaction_status" ON "transaction"("status");

-- AddForeignKey
ALTER TABLE "wallet" ADD CONSTRAINT "wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_senderWalletId_fkey" FOREIGN KEY ("senderWalletId") REFERENCES "wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_receiverWalletId_fkey" FOREIGN KEY ("receiverWalletId") REFERENCES "wallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;
