-- Migration: Add optimistic locking version column to reservations table
-- Required by @Version annotation added to Reservation entity for concurrent booking protection
-- Apply BEFORE deploying the new backend JAR.

SET @col_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME   = 'reservations'
      AND COLUMN_NAME  = 'version'
);

-- Only add the column when it doesn't already exist (idempotent)
SET @sql = IF(
    @col_exists = 0,
    'ALTER TABLE reservations ADD COLUMN version INT NOT NULL DEFAULT 0',
    'SELECT ''Column version already exists in reservations, skipping'' AS migration_status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verify
SELECT
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME   = 'reservations'
  AND COLUMN_NAME  = 'version';
