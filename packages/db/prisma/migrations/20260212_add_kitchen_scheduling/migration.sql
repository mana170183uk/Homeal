-- Add kitchen scheduling fields to Chef
ALTER TABLE `Chef` ADD COLUMN `dailyOrderCap` INTEGER NULL;
ALTER TABLE `Chef` ADD COLUMN `orderCutoffTime` VARCHAR(5) NULL;
ALTER TABLE `Chef` ADD COLUMN `vacationStart` DATE NULL;
ALTER TABLE `Chef` ADD COLUMN `vacationEnd` DATE NULL;

-- Add scheduling fields to Menu
ALTER TABLE `Menu` ADD COLUMN `isClosed` BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE `Menu` ADD COLUMN `notes` VARCHAR(500) NULL;

-- Replace non-unique index with unique constraint on Menu(chefId, date)
DROP INDEX `Menu_chefId_date_idx` ON `Menu`;
CREATE UNIQUE INDEX `Menu_chefId_date_key` ON `Menu`(`chefId`, `date`);

-- Add sortOrder to MenuItem
ALTER TABLE `MenuItem` ADD COLUMN `sortOrder` INTEGER NOT NULL DEFAULT 0;

-- Create MenuTemplate table
CREATE TABLE `MenuTemplate` (
    `id` VARCHAR(36) NOT NULL,
    `chefId` VARCHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `items` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `MenuTemplate_chefId_idx`(`chefId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Add foreign key for MenuTemplate
ALTER TABLE `MenuTemplate` ADD CONSTRAINT `MenuTemplate_chefId_fkey` FOREIGN KEY (`chefId`) REFERENCES `Chef`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
