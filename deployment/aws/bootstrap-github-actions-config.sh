#!/usr/bin/env bash
set -euo pipefail

# Bulk-create/update GitHub Actions Secrets and Variables for BookMyHotel
# from the github-actions.env file in this directory.
# Requires GitHub CLI: https://cli.github.com/
#
# Usage:
#   ./bootstrap-github-actions-config.sh                   # uses github-actions.env in same dir
#   ./bootstrap-github-actions-config.sh /path/to/other.env
#   GH_REPO=owner/repo ./bootstrap-github-actions-config.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${1:-$SCRIPT_DIR/github-actions.env}"
REPO="${GITHUB_REPOSITORY:-${GH_REPO:-}}"

if [[ ! -f "$ENV_FILE" && "$ENV_FILE" != /* ]]; then
  if [[ -f "$SCRIPT_DIR/$ENV_FILE" ]]; then
    ENV_FILE="$SCRIPT_DIR/$ENV_FILE"
  fi
fi

if [[ -z "$REPO" ]]; then
  REPO="$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || true)"
fi

if [[ -z "$REPO" ]]; then
  remote_url="$(git config --get remote.origin.url 2>/dev/null || true)"
  if [[ -n "$remote_url" ]]; then
    REPO="$(printf '%s' "$remote_url" | sed -E 's#.*github.com[:/]([^/]+/[^/.]+)(\.git)?#\1#')"
  fi
fi

if [[ -z "$REPO" ]]; then
  echo "ERROR: Could not determine repository. Set GH_REPO (example: owner/repo)."
  exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: Env file not found: $ENV_FILE"
  exit 1
fi

if ! command -v gh >/dev/null 2>&1; then
  echo "ERROR: GitHub CLI (gh) is required. Install from https://cli.github.com/"
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "ERROR: Not authenticated with gh. Run: gh auth login"
  exit 1
fi

echo "Repository : $REPO"
echo "Env file   : $ENV_FILE"
echo ""

# Keys stored as GitHub Secrets (sensitive)
SECRET_KEYS=(
  LIGHTSAIL_SSH_KEY_B64
  MYSQL_PASSWORD
  JWT_SECRET
  GRAPH_CLIENT_ID
  GRAPH_TENANT_ID
  GRAPH_CLIENT_SECRET
  SPRING_MAIL_USERNAME
  SPRING_MAIL_PASSWORD
)

# Keys stored as GitHub Variables (non-sensitive)
VARIABLE_KEYS=(
  LIGHTSAIL_HOST
  LIGHTSAIL_USER
  SERVER_PORT
  SERVER_SERVLET_CONTEXT_PATH
  MYSQL_HOST
  MYSQL_PORT
  MYSQL_DATABASE
  MYSQL_USER
  JWT_EXPIRATION
  APP_FRONTEND_URL
  CORS_ALLOWED_ORIGINS
  APP_EMAIL_FROM
  APP_NAME
  SPRING_MAIL_HOST
  SPRING_MAIL_PORT
  MICROSOFT_GRAPH_SCOPES
  IMAGE_UPLOAD_BASE_DIR
  IMAGE_UPLOAD_BASE_URL
)

# Keys allowed to be blank (will be skipped without error)
ALLOW_EMPTY_KEYS=(
  SPRING_MAIL_USERNAME
  SPRING_MAIL_PASSWORD
)

contains_key() {
  local key="$1"; shift
  local item
  for item in "$@"; do [[ "$item" == "$key" ]] && return 0; done
  return 1
}

set_count=0
skip_count=0
line_no=0
has_valid_ssh_key=false

while IFS= read -r raw_line || [[ -n "$raw_line" ]]; do
  ((line_no+=1))
  line="$raw_line"

  # Skip comments and blank lines
  [[ -z "${line//[[:space:]]/}" ]] && continue
  [[ "${line#\#}" != "$line" ]] && continue

  if [[ "$line" != *"="* ]]; then
    echo "WARN: Skipping malformed line $line_no: $line"
    ((skip_count+=1))
    continue
  fi

  key="${line%%=*}"
  value="${line#*=}"
  value="${value%$'\r'}"  # normalize CRLF

  # Strip quotes
  if [[ "$value" == \"*\" ]]; then
    value="${value:1:${#value}-2}"
  elif [[ "$value" == \'*\' ]]; then
    value="${value:1:${#value}-2}"
  fi

  # Trim whitespace from key
  key="${key##[[:space:]]}"
  key="${key%%[[:space:]]}"

  [[ -z "$key" ]] && { ((skip_count+=1)); continue; }

  # Only process keys explicitly listed above
  if ! contains_key "$key" "${SECRET_KEYS[@]}" && ! contains_key "$key" "${VARIABLE_KEYS[@]}"; then
    echo "WARN: Unknown key (not in allowlist), skipped: $key"
    ((skip_count+=1))
    continue
  fi

  # Reject placeholder values
  if [[ "$value" == REPLACE_ME* || "$value" == REPLACE_WITH_* ]]; then
    if contains_key "$key" "${ALLOW_EMPTY_KEYS[@]}"; then
      value=""
    else
      echo "ERROR: Placeholder value detected for required key '$key' at line $line_no"
      echo "       Replace the placeholder in $ENV_FILE and rerun."
      exit 1
    fi
  fi

  # Reject empty values for non-optional keys
  if [[ -z "$value" ]] && ! contains_key "$key" "${ALLOW_EMPTY_KEYS[@]}"; then
    echo "ERROR: Empty value for required key '$key' at line $line_no"
    echo "       Set the value in $ENV_FILE and rerun."
    exit 1
  fi

  if [[ "$key" == "LIGHTSAIL_SSH_KEY_B64" && -n "$value" ]]; then
    has_valid_ssh_key=true
  fi

  if contains_key "$key" "${SECRET_KEYS[@]}"; then
    printf '%s' "$value" | gh secret set "$key" --repo "$REPO" >/dev/null
    echo "  secret  : $key"
    ((set_count+=1))
    continue
  fi

  if contains_key "$key" "${VARIABLE_KEYS[@]}"; then
    gh variable set "$key" --body "$value" --repo "$REPO" >/dev/null
    echo "  variable: $key"
    ((set_count+=1))
    continue
  fi

done < "$ENV_FILE"

if ! $has_valid_ssh_key; then
  echo ""
  echo "ERROR: LIGHTSAIL_SSH_KEY_B64 is empty or a placeholder."
  echo "       Run: base64 -i ~/.ssh/bookmyhotel-aws | tr -d '\\n'"
  echo "       and paste the output as the LIGHTSAIL_SSH_KEY_B64 value."
  exit 1
fi

echo ""
echo "Done. Set $set_count entries, skipped $skip_count."
echo ""
echo "Next steps:"
echo "  1. Push a commit to 'stage' branch, then open a PR → main"
echo "  2. Merge the PR — the workflow triggers automatically"
echo "  3. Monitor at: https://github.com/$REPO/actions"
