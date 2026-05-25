#!/bin/bash

set -euo pipefail

MODE="${1:-execute}"
CONFIG_ENV="${2:-prod}"
LIGHTSAIL_IP="44.204.49.94"
LIGHTSAIL_USER="ubuntu"
SSH_KEY="${HOME}/.ssh/bookmyhotel-aws"
APP_DIR="/opt/bookmyhotel"
SERVICE_NAME="bookmyhotel-backend"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

if [[ "$MODE" != "execute" && "$MODE" != "dry-run" ]]; then
    print_error "Usage: $0 [execute|dry-run] [prod|prod-new]"
    exit 1
fi

if [[ ! -f "$SSH_KEY" ]]; then
    print_error "SSH key file not found: $SSH_KEY"
    exit 1
fi

SSH_OPTS="-i $SSH_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"
REPORT_ONLY="false"
STOP_SERVICE="true"

if [[ "$MODE" == "dry-run" ]]; then
    REPORT_ONLY="true"
    STOP_SERVICE="false"
fi

print_status "Preparing $MODE for Ethiopian demo reseed on $LIGHTSAIL_IP using application-${CONFIG_ENV}.properties"

ssh $SSH_OPTS ${LIGHTSAIL_USER}@${LIGHTSAIL_IP} \
  MODE="$MODE" CONFIG_ENV="$CONFIG_ENV" STOP_SERVICE="$STOP_SERVICE" REPORT_ONLY="$REPORT_ONLY" APP_DIR="$APP_DIR" SERVICE_NAME="$SERVICE_NAME" \
  'bash -s' <<'EOF'
set -euo pipefail

CONFIG_FILE="${APP_DIR}/config/application-${CONFIG_ENV}.properties"
JAR_FILE="${APP_DIR}/app.jar"
BACKUP_DIR="${APP_DIR}/backups"
RUN_LOG="${APP_DIR}/logs/ethiopian-demo-reseed-$(date +%Y%m%d_%H%M%S).log"

if [[ ! -f "$CONFIG_FILE" ]]; then
  echo "❌ Config file not found: $CONFIG_FILE"
  exit 1
fi

if [[ ! -f "$JAR_FILE" ]]; then
  echo "❌ Backend jar not found: $JAR_FILE"
  exit 1
fi

mkdir -p "$BACKUP_DIR"

DB_URL=$(grep '^spring.datasource.url=' "$CONFIG_FILE" | cut -d'=' -f2-)
DB_USER=$(grep '^spring.datasource.username=' "$CONFIG_FILE" | cut -d'=' -f2-)
DB_PASS=$(grep '^spring.datasource.password=' "$CONFIG_FILE" | cut -d'=' -f2-)

if [[ -z "$DB_URL" || -z "$DB_USER" || -z "$DB_PASS" ]]; then
  echo "❌ Could not parse datasource properties from $CONFIG_FILE"
  exit 1
fi

if ! command -v mysql >/dev/null 2>&1; then
  sudo apt-get update -y >/dev/null
  sudo apt-get install -y mysql-client >/dev/null
fi

if ! command -v mysqldump >/dev/null 2>&1; then
  sudo apt-get update -y >/dev/null
  sudo apt-get install -y mysql-client >/dev/null
fi

DB_URL_NO_PREFIX=$(echo "$DB_URL" | sed -E 's#^jdbc:mysql://##')
DB_URL_NO_PARAMS=$(echo "$DB_URL_NO_PREFIX" | sed -E 's/\?.*$//')
DB_HOST_PORT=$(echo "$DB_URL_NO_PARAMS" | cut -d'/' -f1)
DB_NAME=$(echo "$DB_URL_NO_PARAMS" | cut -d'/' -f2)
DB_HOST=$(echo "$DB_HOST_PORT" | cut -d':' -f1)
DB_PORT=$(echo "$DB_HOST_PORT" | cut -s -d':' -f2)
DB_PORT=${DB_PORT:-3306}

BACKUP_FILE="$BACKUP_DIR/bookmyhotel-before-ethiopian-demo-$(date +%Y%m%d_%H%M%S).sql"
echo "[INFO] Creating backup at $BACKUP_FILE"
mysqldump -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" > "$BACKUP_FILE"

echo "[INFO] Normalizing legacy role schema before reseed"
mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" <<'SQL'
ALTER TABLE user_roles MODIFY COLUMN role VARCHAR(50) NULL;
SQL

if [[ "${STOP_SERVICE}" == "true" ]]; then
  echo "[INFO] Stopping ${SERVICE_NAME} before destructive reseed"
  sudo systemctl stop ${SERVICE_NAME}
else
  echo "[INFO] Leaving ${SERVICE_NAME} running because this is dry-run mode"
fi

echo "[INFO] Running one-off backend bootstrap in ${MODE} mode"
JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64 \
java -jar "$JAR_FILE" \
  --spring.config.additional-location=file:${CONFIG_FILE} \
  --spring.main.web-application-type=none \
  --app.bootstrap.super-admin.enabled=true \
  --app.bootstrap.ethiopian-demo.enabled=true \
  --app.bootstrap.ethiopian-demo.report-only=${REPORT_ONLY} \
  --app.bootstrap.exit-after-run=true \
  > "$RUN_LOG" 2>&1

echo "[INFO] One-off bootstrap log saved to $RUN_LOG"
tail -n 120 "$RUN_LOG"

if [[ "${STOP_SERVICE}" == "true" ]]; then
  echo "[INFO] Restarting ${SERVICE_NAME} after reseed"
  sudo systemctl start ${SERVICE_NAME}
  sudo systemctl status ${SERVICE_NAME} --no-pager
fi
EOF

print_status "Completed $MODE run for Ethiopian demo reseed"