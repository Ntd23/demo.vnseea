-- English description: Adds a Page-scoped index on Wo_Messages so the Page Inbox can list conversations without scanning every message.
-- Wo_Messages is large: run this off-peak. It is skipped when an index that
-- starts with `page_id` already exists.

SET @vnseea_schema = DATABASE();

SET @vnseea_sql = IF(
  EXISTS(
    SELECT 1
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = @vnseea_schema
      AND TABLE_NAME = 'Wo_Messages'
      AND COLUMN_NAME = 'page_id'
      AND SEQ_IN_INDEX = 1
  ),
  'SELECT 1',
  'ALTER TABLE `Wo_Messages` ADD INDEX `page_inbox` (`page_id`, `id`), ALGORITHM=INPLACE, LOCK=NONE'
);
PREPARE vnseea_stmt FROM @vnseea_sql;
EXECUTE vnseea_stmt;
DEALLOCATE PREPARE vnseea_stmt;
