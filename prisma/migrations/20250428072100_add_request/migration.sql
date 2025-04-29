-- CreateEnum
CREATE TYPE "request_status" AS ENUM ('NEW', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "request" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "subject" VARCHAR(512) NOT NULL,
    "description" TEXT NOT NULL,
    "solution_text" TEXT,
    "cancel_reason" TEXT,
    "request_status" "request_status" NOT NULL DEFAULT 'NEW',

    CONSTRAINT "request_pkey" PRIMARY KEY ("id")
);
