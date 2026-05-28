-- CreateTable
CREATE TABLE `customers` (
    `id` VARCHAR(50) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(50) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `company` VARCHAR(255) NOT NULL,
    `status` ENUM('active', 'lead', 'inactive') NOT NULL DEFAULT 'active',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notes` (
    `id` VARCHAR(50) NOT NULL,
    `customer_id` VARCHAR(50) NOT NULL,
    `text` TEXT NOT NULL,
    `author` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ticket_statuses` (
    `id` VARCHAR(50) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `color` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `notes` ADD CONSTRAINT `notes_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
