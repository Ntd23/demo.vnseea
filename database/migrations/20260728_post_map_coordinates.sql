-- English description: Persists exact coordinates and Google place identifiers for post locations.

SET @vnseea_schema = DATABASE();

SET @vnseea_sql = IF(
  EXISTS(
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = @vnseea_schema
      AND TABLE_NAME = 'Wo_Posts'
      AND COLUMN_NAME = 'postMapLat'
  ),
  'SELECT 1',
  'ALTER TABLE `Wo_Posts` ADD COLUMN `postMapLat` DECIMAL(10,7) NULL DEFAULT NULL AFTER `postMap`'
);
PREPARE vnseea_stmt FROM @vnseea_sql;
EXECUTE vnseea_stmt;
DEALLOCATE PREPARE vnseea_stmt;

SET @vnseea_sql = IF(
  EXISTS(
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = @vnseea_schema
      AND TABLE_NAME = 'Wo_Posts'
      AND COLUMN_NAME = 'postMapLng'
  ),
  'SELECT 1',
  'ALTER TABLE `Wo_Posts` ADD COLUMN `postMapLng` DECIMAL(10,7) NULL DEFAULT NULL AFTER `postMapLat`'
);
PREPARE vnseea_stmt FROM @vnseea_sql;
EXECUTE vnseea_stmt;
DEALLOCATE PREPARE vnseea_stmt;

SET @vnseea_sql = IF(
  EXISTS(
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = @vnseea_schema
      AND TABLE_NAME = 'Wo_Posts'
      AND COLUMN_NAME = 'postMapPlaceId'
  ),
  'SELECT 1',
  'ALTER TABLE `Wo_Posts` ADD COLUMN `postMapPlaceId` VARCHAR(255) NOT NULL DEFAULT '''' AFTER `postMapLng`'
);
PREPARE vnseea_stmt FROM @vnseea_sql;
EXECUTE vnseea_stmt;
DEALLOCATE PREPARE vnseea_stmt;
