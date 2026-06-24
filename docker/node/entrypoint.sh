#!/bin/sh
set -e

cd /app

if [ "$#" -gt 0 ]; then
  exec "$@"
fi

if [ ! -f package.json ]; then
  echo "Projeto ainda nao instalado em ./web (package.json nao encontrado)."
  echo "Exemplo: docker compose run --rm web npm create vite@latest . -- --template react-ts"
  exec tail -f /dev/null
fi

if [ ! -d node_modules ]; then
  npm install
fi

exec npm run start
