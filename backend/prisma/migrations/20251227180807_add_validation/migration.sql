-- CreateEnum
CREATE TYPE "Validation" AS ENUM ('PENDING', 'VALIDATED', 'REJECTED');

-- AlterTable
ALTER TABLE "Incident" ADD COLUMN     "validation" "Validation" NOT NULL DEFAULT 'PENDING';
