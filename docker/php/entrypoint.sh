#!/bin/sh
set -e

cd /var/www/html

if [ ! -f artisan ]; then
  echo "Laravel não encontrado em /var/www/html. Pulando migrate/seed."
  exec docker-php-entrypoint "$@"
fi

echo "Aguardando banco de dados..."
until php artisan db:monitor --databases=mysql > /dev/null 2>&1; do
  sleep 2
done

echo "Verificando migrations pendentes..."
if php artisan migrate:status | grep -q "Pending"; then
  echo "Executando migrations..."
  php artisan migrate --force
else
  echo "Nenhuma migration pendente."
fi

echo "Sincronizando perfis e permissões..."
php artisan db:seed --force --class=RoleSeeder

SEED_MARKER="/var/www/html/storage/app/.seeded"

if [ ! -f "$SEED_MARKER" ]; then
  echo "Primeira execução detectada — executando seeders..."
  mkdir -p /var/www/html/storage/app
  touch "$SEED_MARKER"
  php artisan db:seed --force
else
  echo "Banco já inicializado, pulando seeders."
fi

exec docker-php-entrypoint "$@"
