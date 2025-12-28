/*
  Warnings:

  - You are about to drop the column `voted` on the `VotedIncident` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "VotedIncident" DROP COLUMN "voted",
ADD COLUMN     "downVoted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "upVoted" BOOLEAN NOT NULL DEFAULT false;
