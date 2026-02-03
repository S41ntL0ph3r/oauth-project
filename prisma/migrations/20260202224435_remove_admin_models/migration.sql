/*
  Warnings:

  - You are about to drop the `admin_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `admins` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `products` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ConsentType" AS ENUM ('TERMS_OF_SERVICE', 'PRIVACY_POLICY', 'MARKETING_EMAILS', 'DATA_PROCESSING', 'COOKIES', 'ANALYTICS', 'THIRD_PARTY_SHARING');

-- CreateEnum
CREATE TYPE "RequestType" AS ENUM ('DATA_EXPORT', 'DATA_CORRECTION', 'DATA_DELETION', 'DATA_ANONYMIZATION', 'ACCESS_INFO');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "admin_logs" DROP CONSTRAINT "admin_logs_adminId_fkey";

-- DropForeignKey
ALTER TABLE "admins" DROP CONSTRAINT "admins_createdById_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_createdById_fkey";

-- DropTable
DROP TABLE "admin_logs";

-- DropTable
DROP TABLE "admins";

-- DropTable
DROP TABLE "products";

-- DropEnum
DROP TYPE "AdminRole";

-- DropEnum
DROP TYPE "AdminStatus";

-- DropEnum
DROP TYPE "ProductStatus";

-- CreateTable
CREATE TABLE "user_consents" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "consentType" "ConsentType" NOT NULL,
    "purpose" TEXT NOT NULL,
    "granted" BOOLEAN NOT NULL DEFAULT false,
    "grantedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_consents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_access_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "accessedBy" TEXT NOT NULL,
    "accessType" TEXT NOT NULL,
    "dataType" TEXT NOT NULL,
    "reason" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "data_access_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_requests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "requestType" "RequestType" NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "data" JSONB,
    "notes" TEXT,
    "processedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "data_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_consents_userId_consentType_idx" ON "user_consents"("userId", "consentType");

-- CreateIndex
CREATE INDEX "data_access_logs_userId_createdAt_idx" ON "data_access_logs"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "data_access_logs_accessedBy_createdAt_idx" ON "data_access_logs"("accessedBy", "createdAt");

-- CreateIndex
CREATE INDEX "data_requests_userId_status_idx" ON "data_requests"("userId", "status");

-- AddForeignKey
ALTER TABLE "user_consents" ADD CONSTRAINT "user_consents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_access_logs" ADD CONSTRAINT "data_access_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_requests" ADD CONSTRAINT "data_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
