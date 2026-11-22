#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [[ -f .env.local ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env.local
  set +a
elif [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

BACKUP_DIR="${BACKUP_DIR:-backups}"
mkdir -p "$BACKUP_DIR"
STAMP="$(date +%Y%m%d-%H%M%S)"
FILE="$BACKUP_DIR/leguard-$STAMP.dump"

if [[ -n "${DATABASE_URL:-}" ]] && command -v pg_dump >/dev/null 2>&1; then
  pg_dump "$DATABASE_URL" --format=custom --file "$FILE"
elif command -v docker >/dev/null 2>&1; then
  CONTAINER="${PG_CONTAINER:-leguard-postgres}"
  docker exec -e PGPASSWORD="${PGPASSWORD:-}" "$CONTAINER" \
    pg_dump -U "${POSTGRES_USER:-leguard}" -d "${POSTGRES_DB:-leguard}" \
    --format=custom > "$FILE"
else
  echo "pg_dump is not available and Docker is not installed." >&2
  exit 1
fi

if [[ ! -s "$FILE" ]]; then
  echo "Backup failed: $FILE is empty." >&2
  exit 1
fi

echo "Backup written to $FILE"
