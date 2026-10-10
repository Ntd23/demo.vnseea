-- English description: Lets Page members with the Messages permission reply as the Page and records which member sent each reply.

-- Who actually sent a Page-side reply. Kept out of Wo_Messages on purpose:
-- many customer-facing reads use SELECT * on Wo_Messages, and the customer
-- must only ever see the Page, never the member behind it.
CREATE TABLE IF NOT EXISTS `Wo_PageMessageSenders` (
  `message_id` BIGINT UNSIGNED NOT NULL,
  `page_id` BIGINT UNSIGNED NOT NULL,
  `sent_by_user_id` BIGINT UNSIGNED NOT NULL,
  `created_at` BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (`message_id`),
  KEY `page_sender` (`page_id`, `sent_by_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- New per-admin privilege. Defaults to 0 so existing admins only get inbox
-- access once the Page owner turns it on for them.
SET @vnseea_schema = DATABASE();

SET @vnseea_sql = IF(
  EXISTS(
    SELECT 1
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = @vnseea_schema
      AND TABLE_NAME = 'Wo_PageAdmins'
      AND COLUMN_NAME = 'messages'
  ),
  'SELECT 1',
  'ALTER TABLE `Wo_PageAdmins` ADD COLUMN `messages` TINYINT(1) NOT NULL DEFAULT 0'
);
PREPARE vnseea_stmt FROM @vnseea_sql;
EXECUTE vnseea_stmt;
DEALLOCATE PREPARE vnseea_stmt;
