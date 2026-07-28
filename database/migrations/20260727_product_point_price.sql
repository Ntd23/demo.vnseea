-- English description: Adds point-price snapshots to marketplace products, orders, and purchases.

SET @vnseea_schema = DATABASE();

SET @vnseea_sql = IF(
  EXISTS(
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = @vnseea_schema
      AND TABLE_NAME = 'Wo_Products'
      AND COLUMN_NAME = 'point'
  ),
  'SELECT 1',
  'ALTER TABLE `Wo_Products` ADD COLUMN `point` BIGINT UNSIGNED NOT NULL DEFAULT 0 AFTER `price`'
);
PREPARE vnseea_stmt FROM @vnseea_sql;
EXECUTE vnseea_stmt;
DEALLOCATE PREPARE vnseea_stmt;

SET @vnseea_sql = IF(
  EXISTS(
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = @vnseea_schema
      AND TABLE_NAME = 'Wo_UserOrders'
      AND COLUMN_NAME = 'point'
  ),
  'SELECT 1',
  'ALTER TABLE `Wo_UserOrders` ADD COLUMN `point` BIGINT UNSIGNED NOT NULL DEFAULT 0 AFTER `price`'
);
PREPARE vnseea_stmt FROM @vnseea_sql;
EXECUTE vnseea_stmt;
DEALLOCATE PREPARE vnseea_stmt;

SET @vnseea_sql = IF(
  EXISTS(
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = @vnseea_schema
      AND TABLE_NAME = 'Wo_Purchases'
      AND COLUMN_NAME = 'point'
  ),
  'SELECT 1',
  'ALTER TABLE `Wo_Purchases` ADD COLUMN `point` BIGINT UNSIGNED NOT NULL DEFAULT 0 AFTER `price`'
);
PREPARE vnseea_stmt FROM @vnseea_sql;
EXECUTE vnseea_stmt;
DEALLOCATE PREPARE vnseea_stmt;
