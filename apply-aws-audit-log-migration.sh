#!/bin/bash

# AWS RDS Migration: Create system_audit_logs table for audit feature
# Run this script once against production RDS to apply the audit table migration.

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status()  { echo -e "${GREEN}[INFO]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error()   { echo -e "${RED}[ERROR]${NC} $1"; }

RDS_HOST="ls-8311e96711f66659c24704361078cb72180ec867.c6nugs2ycbsp.us-east-1.rds.amazonaws.com"
RDS_PORT="3306"
RDS_DATABASE="bookmyhotel"
RDS_USERNAME="admin"
RDS_PASSWORD="BookMyHotel2024SecureDB!"

print_status "Starting AWS RDS migration: Create system_audit_logs table"
print_status "Target: $RDS_HOST:$RDS_PORT/$RDS_DATABASE"

# Check mysql client is available
if ! command -v mysql &>/dev/null; then
    print_error "mysql client not found. Install it and retry."
    exit 1
fi

# Check if table already exists
TABLE_EXISTS=$(mysql -h "$RDS_HOST" -P "$RDS_PORT" -u "$RDS_USERNAME" -p"$RDS_PASSWORD" \
    "$RDS_DATABASE" --skip-column-names -e \
    "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='$RDS_DATABASE' AND table_name='system_audit_logs';" 2>/dev/null)

if [ "$TABLE_EXISTS" -gt "0" ]; then
    print_warning "Table system_audit_logs already exists — skipping creation."
    exit 0
fi

print_status "Creating system_audit_logs table..."

mysql -h "$RDS_HOST" -P "$RDS_PORT" -u "$RDS_USERNAME" -p"$RDS_PASSWORD" "$RDS_DATABASE" <<'SQL'
CREATE TABLE IF NOT EXISTS system_audit_logs (
  id BIGINT NOT NULL AUTO_INCREMENT,
  entity_type VARCHAR(50) NOT NULL,
  entity_id BIGINT NULL,
  action VARCHAR(50) NOT NULL,
  description TEXT NULL,
  old_values TEXT NULL,
  new_values TEXT NULL,
  performed_by_user_id BIGINT NULL,
  performed_by_user_name VARCHAR(200) NULL,
  performed_by_user_email VARCHAR(200) NULL,
  performed_by_user_role VARCHAR(50) NULL,
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,
  request_path VARCHAR(500) NULL,
  request_method VARCHAR(10) NULL,
  response_status INT NULL,
  performed_at DATETIME(6) NOT NULL,
  success TINYINT(1) NOT NULL DEFAULT 1,
  error_message TEXT NULL,
  created_at DATETIME(6) NULL,
  updated_at DATETIME(6) NULL,
  PRIMARY KEY (id),
  INDEX idx_sys_audit_user (performed_by_user_id),
  INDEX idx_sys_audit_action (action),
  INDEX idx_sys_audit_entity (entity_type, entity_id),
  INDEX idx_sys_audit_time (performed_at),
  INDEX idx_sys_audit_role (performed_by_user_role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
SQL

print_status "✅ system_audit_logs table created successfully."
