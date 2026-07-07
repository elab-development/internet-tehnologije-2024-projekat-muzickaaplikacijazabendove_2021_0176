-- AlterTable
ALTER TABLE `band` ADD COLUMN `category` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `Band_category_idx` ON `Band`(`category`);
