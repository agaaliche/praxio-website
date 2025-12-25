-- Migration: Create authorized_users table for Praxio
-- Date: 2025-12-25
-- Description: User management for account team members

CREATE TABLE IF NOT EXISTS `authorized_users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `account_owner_id` VARCHAR(128) NOT NULL COMMENT 'Firebase UID of account owner',
  `email` VARCHAR(255) NOT NULL,
  `first_name` VARCHAR(100) DEFAULT NULL,
  `last_name` VARCHAR(100) DEFAULT NULL,
  `role` ENUM('viewer', 'editor') NOT NULL DEFAULT 'viewer',
  `status` ENUM('pending', 'active', 'expired') NOT NULL DEFAULT 'pending',
  `invite_token` VARCHAR(500) DEFAULT NULL,
  `token_expiry` DATETIME DEFAULT NULL,
  `generated_password` VARCHAR(100) DEFAULT NULL COMMENT 'Temporary password for initial login',
  `last_access` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_account_email` (`account_owner_id`, `email`),
  KEY `idx_account_owner` (`account_owner_id`),
  KEY `idx_email` (`email`),
  KEY `idx_invite_token` (`invite_token`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add comment to table
ALTER TABLE `authorized_users` COMMENT = 'Stores authorized team members for account access';
