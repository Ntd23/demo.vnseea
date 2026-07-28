SET @vnseea_schema = DATABASE();

SET @vnseea_sql = IF(
    EXISTS(
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = @vnseea_schema
          AND TABLE_NAME = 'Wo_UserStory'
          AND COLUMN_NAME = 'overlay_data'
    ),
    'SELECT 1',
    'ALTER TABLE `Wo_UserStory` ADD COLUMN `overlay_data` TEXT NULL AFTER `description`'
);
PREPARE vnseea_stmt FROM @vnseea_sql;
EXECUTE vnseea_stmt;
DEALLOCATE PREPARE vnseea_stmt;
