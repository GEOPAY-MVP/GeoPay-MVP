-- CreateEnum
CREATE TYPE "KYCStatus" AS ENUM ('pending', 'verified', 'rejected', 'under_review');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'inactive', 'suspended', 'blocked');

-- CreateEnum
CREATE TYPE "DeviceStatus" AS ENUM ('active', 'inactive', 'suspended', 'blocked');

-- CreateTable
CREATE TABLE "user" (
    "user_id" TEXT NOT NULL,
    "full_name" TEXT,
    "email" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "cnic" TEXT NOT NULL,
    "date_of_birth" TIMESTAMP(3),
    "address" TEXT,
    "password_hash" TEXT NOT NULL,
    "pin" TEXT NOT NULL,
    "kyc_status" "KYCStatus" NOT NULL DEFAULT 'pending',
    "is_two_fa_enabled" BOOLEAN NOT NULL DEFAULT false,
    "two_fa_method" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'active',
    "registered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_login_at" TIMESTAMP(3),

    CONSTRAINT "user_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "device" (
    "device_id" TEXT NOT NULL,
    "os_type" TEXT,
    "device_fingerprint" TEXT NOT NULL,
    "device_name" TEXT,
    "status" "DeviceStatus" NOT NULL DEFAULT 'active',
    "is_biometric_enabled" BOOLEAN NOT NULL DEFAULT false,
    "biometric_public_key" TEXT,
    "fcm_token" TEXT,

    CONSTRAINT "device_pkey" PRIMARY KEY ("device_id")
);

-- CreateTable
CREATE TABLE "user_device" (
    "user_device_id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "registered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_active_at" TIMESTAMP(3),
    "trusted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_device_pkey" PRIMARY KEY ("user_device_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_phone_number_key" ON "user"("phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "user_cnic_key" ON "user"("cnic");

-- CreateIndex
CREATE UNIQUE INDEX "device_device_fingerprint_key" ON "device"("device_fingerprint");

-- CreateIndex
CREATE UNIQUE INDEX "user_device_user_id_device_id_key" ON "user_device"("user_id", "device_id");

-- AddForeignKey
ALTER TABLE "user_device" ADD CONSTRAINT "user_device_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_device" ADD CONSTRAINT "user_device_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "device"("device_id") ON DELETE CASCADE ON UPDATE CASCADE;
