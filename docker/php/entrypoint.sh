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

echo "Executando migrations..."
php artisan migrate --force

echo "Executando seeders..."
php artisan db:seed --force

exec docker-php-entrypoint "$@"
