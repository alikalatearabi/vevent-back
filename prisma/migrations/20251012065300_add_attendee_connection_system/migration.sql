/*
  Warnings:

  - You are about to drop the column `name` on the `Attendee` table. All the data in the column will be lost.
  - Added the required column `firstName` to the `Attendee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `Attendee` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AttendeeRole" AS ENUM ('SPEAKER', 'VISITOR', 'GUEST', 'ADMIN', 'MODERATOR');

-- CreateEnum
CREATE TYPE "ConnectionStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- Add new columns first with temporary defaults
ALTER TABLE "Attendee" 
ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "company" TEXT,
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "jobTitle" TEXT,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "role" "AttendeeRole" NOT NULL DEFAULT 'VISITOR',
ADD COLUMN     "showCompany" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showEmail" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showPhone" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "email" DROP NOT NULL;

-- Update existing data: split the name column into firstName and lastName
UPDATE "Attendee" 
SET 
  "firstName" = CASE 
    WHEN POSITION(' ' in "name") > 0 THEN SUBSTRING("name" FROM 1 FOR POSITION(' ' in "name") - 1)
    ELSE "name"
  END,
  "lastName" = CASE 
    WHEN POSITION(' ' in "name") > 0 THEN SUBSTRING("name" FROM POSITION(' ' in "name") + 1)
    ELSE ''
  END
WHERE "firstName" IS NULL OR "lastName" IS NULL;

-- Make firstName and lastName required
ALTER TABLE "Attendee" 
ALTER COLUMN "firstName" SET NOT NULL,
ALTER COLUMN "lastName" SET NOT NULL;

-- Drop the old name column
ALTER TABLE "Attendee" DROP COLUMN "name";

-- CreateTable
CREATE TABLE "ConnectionRequest" (
    "id" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "eventId" TEXT,
    "status" "ConnectionStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "requestDateTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responseDateTime" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConnectionRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ConnectionRequest_requesterId_idx" ON "ConnectionRequest"("requesterId");

-- CreateIndex
CREATE INDEX "ConnectionRequest_receiverId_idx" ON "ConnectionRequest"("receiverId");

-- CreateIndex
CREATE INDEX "ConnectionRequest_status_idx" ON "ConnectionRequest"("status");

-- CreateIndex
CREATE INDEX "ConnectionRequest_eventId_idx" ON "ConnectionRequest"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "ConnectionRequest_requesterId_receiverId_eventId_key" ON "ConnectionRequest"("requesterId", "receiverId", "eventId");

-- CreateIndex
CREATE INDEX "Attendee_userId_idx" ON "Attendee"("userId");

-- CreateIndex
CREATE INDEX "Attendee_role_idx" ON "Attendee"("role");

-- AddForeignKey
ALTER TABLE "ConnectionRequest" ADD CONSTRAINT "ConnectionRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "Attendee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConnectionRequest" ADD CONSTRAINT "ConnectionRequest_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "Attendee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConnectionRequest" ADD CONSTRAINT "ConnectionRequest_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
