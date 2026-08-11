-- English description: Allows phone-only accounts to omit email without synthetic placeholder addresses.

SET @vnseea_schema = DATABASE();

SET @vnseea_sql = IF(
  EXISTS(
    SELECT 1
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = @vnseea_schema
      AND LOWER(TABLE_NAME) = 'wo_users'
      AND COLUMN_NAME = 'email'
      AND IS_NULLABLE = 'NO'
  ),
  'ALTER TABLE `Wo_Users` MODIFY COLUMN `email` VARCHAR(255) NULL DEFAULT NULL',
  'SELECT 1'
);
PREPARE vnseea_stmt FROM @vnseea_sql;
EXECUTE vnseea_stmt;
DEALLOCATE PREPARE vnseea_stmt;
