#!/usr/bin/env bash
set -e

npx prisma generate

if [ -n "$DATABASE_URL" ]; then
  echo "DATABASE_URL found — running migrations and seeding admin..."
  npx prisma migrate deploy
  npx tsx scripts/seed-admin.ts
else
  echo "DATABASE_URL not set — skipping migrations and seed"
fi

npm run build
