/*
  Warnings:

  - Added the required column `city` to the `Incident` table without a default value. This is not possible if the table is not empty.
  - Added the required column `latitude` to the `Incident` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude` to the `Incident` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `Incident` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Incident" ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "latitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "longitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "state" TEXT NOT NULL;
