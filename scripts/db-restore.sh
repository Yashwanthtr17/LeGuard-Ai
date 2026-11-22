#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <backup-file> [--yes]" >&2
  exit 1
fi

FILE="$1"
if [[ ! -s "$FILE" ]]; then
  echo "Backup file not found or empty: $FILE" >&2
  exit 1
fi

if [[ "${2:-}" != "--yes" && "${RESTORE_CONFIRM:-}" != "yes" ]]; then
  echo "Restore is destructive. Re-run with --yes or RESTORE_CONFIRM=yes to continue." >&2
  exit 1
fi

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

if [[ -n "${DATABASE_URL:-}" ]] && command -v pg_restore >/dev/null 2>&1; then
  pg_restore --clean --if-exists --no-owner --dbname "$DATABASE_URL" "$FILE"
elif command -v docker >/dev/null 2>&1; then
  CONTAINER="${PG_CONTAINER:-leguard-postgres}"
  docker exec -i -e PGPASSWORD="${PGPASSWORD:-}" "$CONTAINER" \
    pg_restore -U "${POSTGRES_USER:-leguard}" -d "${POSTGRES_DB:-leguard}" \
    --clean --if-exists --no-owner < "$FILE"
else
  echo "pg_restore is not available and Docker is not installed." >&2
  exit 1
fi

echo "Restored $FILE"
