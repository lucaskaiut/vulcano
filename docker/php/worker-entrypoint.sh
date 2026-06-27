#!/bin/sh
set -e

cd /var/www/html

echo "[worker] Aguardando banco de dados..."
until php artisan db:monitor --databases=mysql > /dev/null 2>&1; do
  sleep 2
done

echo "[worker] Banco disponível. Aguardando migrations (app principal)..."
# Aguarda a tabela de migrations existir (app já rodou migrate)
until php artisan migrate:status > /dev/null 2>&1; do
  sleep 2
done

echo "[worker] Iniciando queue:work (database)..."
exec php artisan queue:work database --sleep=3 --tries=3 --max-time=3600
