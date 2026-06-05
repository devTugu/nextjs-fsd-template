#!/usr/bin/env bash
set -euo pipefail

API_DIR="${API_DIR:-api}"
API_PID=""

cleanup() {
  if [[ -n "${API_PID}" ]] && kill -0 "${API_PID}" 2>/dev/null; then
    kill "${API_PID}" || true
    wait "${API_PID}" 2>/dev/null || true
  fi
}
trap cleanup EXIT

cd "${API_DIR}"
echo "Building API for E2E..."
npm run build

MAIN_ENTRY=""
if [[ -f "dist/main.js" || -f "dist/main" ]]; then
  MAIN_ENTRY="dist/main"
elif [[ -f "dist/src/main.js" || -f "dist/src/main" ]]; then
  MAIN_ENTRY="dist/src/main"
fi

if [[ -z "${MAIN_ENTRY}" ]]; then
  echo "API build output missing main entry. dist/:"
  ls -la dist || true
  echo "dist/src/:"
  ls -la dist/src || true
  exit 1
fi

echo "Starting API from ${MAIN_ENTRY} ..."
node "${MAIN_ENTRY}" &
API_PID=$!
cd - > /dev/null

echo "Waiting for API at http://localhost:3001/api/v1/health/ready..."
for attempt in $(seq 1 60); do
  if curl -sf http://localhost:3001/api/v1/health/ready > /dev/null; then
    echo "API is ready"
    break
  fi
  if [[ "${attempt}" -eq 60 ]]; then
    echo "API failed to become ready in time"
    exit 1
  fi
  sleep 2
done

npm run test:e2e
