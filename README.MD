## Запуск при помощи Docker

Приложение может быть запущено при помощи Docker. Для этого нужно добавить файл `.env`.

```
POSTGRES_HOST='postgres.requests-app'
POSTGRES_PORT=5432
POSTGRES_USER='postgres'
POSTGRES_PASSWORD='postgres'
POSTGRES_DB='requests_app'
PGDATA='/var/lib/postgresql/data/pgdata'
POSTGRES_SCHEMA='requests_app'

PROMETHEUS_PORT=9090

GF_SECURITY_ADMIN_USER='admin'
GF_SECURITY_ADMIN_PASSWORD='admin'
GRAFANA_PORT=3000

REDIS_HOST='redis.requests-app'
REDIS_PORT=6379
REDIS_USERNAME='default'
REDIS_PASSWORD='admin'
REDIS_DATABASE='0'

DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}?schema=${POSTGRES_SCHEMA}"

PORT=8000
```

Далее ввести команду:

```sh
$ docker compose up
```
