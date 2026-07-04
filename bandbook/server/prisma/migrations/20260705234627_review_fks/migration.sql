/*
  Warnings:

  - You are about to drop the column `comment` on the `review` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[bandId,userId]` on the table `Review` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `review` DROP COLUMN `comment`;

-- CreateIndex
CREATE UNIQUE INDEX `Review_bandId_userId_key` ON `Review`(`bandId`, `userId`);

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_bandId_fkey` FOREIGN KEY (`bandId`) REFERENCES `Band`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;