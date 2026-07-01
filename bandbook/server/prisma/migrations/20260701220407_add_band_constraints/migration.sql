/*
  Warnings:

  - A unique constraint covering the columns `[channelId]` on the table `Band` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Band_channelId_key` ON `Band`(`channelId`);
