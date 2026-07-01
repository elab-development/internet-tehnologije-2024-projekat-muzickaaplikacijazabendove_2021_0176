-- CreateIndex
CREATE INDEX `Band_name_idx` ON `Band`(`name`);

-- CreateIndex
CREATE INDEX `Band_createdAt_idx` ON `Band`(`createdAt`);

-- CreateIndex
CREATE FULLTEXT INDEX `Band_name_description_idx` ON `Band`(`name`, `description`);
