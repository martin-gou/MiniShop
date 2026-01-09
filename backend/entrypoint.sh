#!/bin/sh
set -e

if [ -n "$POSTGRES_HOST" ]; then
  echo "Waiting for Postgres..."
  python - <<'PY'
import os
import sys
import time

import psycopg2

host = os.environ.get("POSTGRES_HOST", "db")
port = int(os.environ.get("POSTGRES_PORT", "5432"))
name = os.environ.get("POSTGRES_DB", "shop")
user = os.environ.get("POSTGRES_USER", "shop")
password = os.environ.get("POSTGRES_PASSWORD", "shop")

for _ in range(30):
    try:
        conn = psycopg2.connect(
            dbname=name,
            user=user,
            password=password,
            host=host,
            port=port,
        )
        conn.close()
        sys.exit(0)
    except Exception:
        time.sleep(1)

print("Postgres is not ready.", file=sys.stderr)
sys.exit(1)
PY
fi

python manage.py migrate --noinput

if [ -n "$DJANGO_SUPERUSER_USERNAME" ] && [ -n "$DJANGO_SUPERUSER_PASSWORD" ]; then
  python manage.py shell -c "import os; from django.contrib.auth import get_user_model; User=get_user_model(); username=os.environ.get('DJANGO_SUPERUSER_USERNAME'); email=os.environ.get('DJANGO_SUPERUSER_EMAIL',''); password=os.environ.get('DJANGO_SUPERUSER_PASSWORD'); exists=User.objects.filter(username=username).exists(); User.objects.create_superuser(username=username, email=email, password=password) if username and password and not exists else None"
fi

exec "$@"
