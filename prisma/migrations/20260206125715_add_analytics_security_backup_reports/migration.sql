-- CreateEnum
CREATE TYPE "SecurityEventType" AS ENUM ('FAILED_LOGIN', 'SUSPICIOUS_LOGIN', 'PASSWORD_CHANGE', 'EMAIL_CHANGE', 'ACCOUNT_LOCKED', 'BRUTE_FORCE_ATTEMPT', 'UNAUTHORIZED_ACCESS', 'DATA_BREACH_ATTEMPT', 'PRIVILEGE_ESCALATION', 'UNUSUAL_ACTIVITY');

-- CreateEnum
CREATE TYPE "SecuritySeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "BackupType" AS ENUM ('FULL', 'INCREMENTAL', 'DIFFERENTIAL', 'MANUAL', 'SCHEDULED');

-- CreateEnum
CREATE TYPE "BackupStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('USERS', 'ANALYTICS', 'SECURITY', 'SESSIONS', 'AUDIT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ReportFormat" AS ENUM ('PDF', 'EXCEL', 'CSV', 'JSON');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'GENERATING', 'COMPLETED', 'FAILED', 'EXPIRED');

-- CreateTable
CREATE TABLE "analytics" (
    "id" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "metadata" JSONB,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionToken" TEXT,
    "action" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "device" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "country" TEXT,
    "city" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "failReason" TEXT,
    "duration" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "security_events" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "eventType" "SecurityEventType" NOT NULL,
    "severity" "SecuritySeverity" NOT NULL,
    "description" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "security_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "BackupType" NOT NULL,
    "status" "BackupStatus" NOT NULL DEFAULT 'PENDING',
    "size" BIGINT,
    "location" TEXT,
    "tablesIncluded" TEXT[],
    "recordCount" INTEGER,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "restoredAt" TIMESTAMP(3),
    "restoredBy" TEXT,
    "metadata" JSONB,

    CONSTRAINT "backups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "ReportType" NOT NULL,
    "format" "ReportFormat" NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "parameters" JSONB,
    "fileUrl" TEXT,
    "fileSize" BIGINT,
    "recordCount" INTEGER,
    "generatedBy" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "downloaded" BOOLEAN NOT NULL DEFAULT false,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "analytics_metric_date_idx" ON "analytics"("metric", "date");

-- CreateIndex
CREATE INDEX "session_logs_userId_createdAt_idx" ON "session_logs"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "session_logs_ipAddress_createdAt_idx" ON "session_logs"("ipAddress", "createdAt");

-- CreateIndex
CREATE INDEX "security_events_userId_createdAt_idx" ON "security_events"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "security_events_eventType_severity_idx" ON "security_events"("eventType", "severity");

-- CreateIndex
CREATE INDEX "security_events_resolved_idx" ON "security_events"("resolved");

-- CreateIndex
CREATE INDEX "backups_status_createdAt_idx" ON "backups"("status", "createdAt");

-- CreateIndex
CREATE INDEX "backups_createdBy_idx" ON "backups"("createdBy");

-- CreateIndex
CREATE INDEX "reports_status_generatedAt_idx" ON "reports"("status", "generatedAt");

-- CreateIndex
CREATE INDEX "reports_generatedBy_idx" ON "reports"("generatedBy");

-- CreateIndex
CREATE INDEX "reports_type_idx" ON "reports"("type");

-- AddForeignKey
ALTER TABLE "session_logs" ADD CONSTRAINT "session_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "security_events" ADD CONSTRAINT "security_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
