-- AlterTable
ALTER TABLE `Project` ADD COLUMN `isProduct` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX `Partner_active_kind_idx` ON `Partner`(`active`, `kind`);

-- CreateIndex
CREATE INDEX `Project_published_isProduct_idx` ON `Project`(`published`, `isProduct`);

-- CreateIndex
CREATE INDEX `Project_sector_idx` ON `Project`(`sector`);
