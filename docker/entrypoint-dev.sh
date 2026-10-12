#!/bin/sh
set -e
# O Compose só inicia este serviço depois que o PostgreSQL está saudável (depends_on + healthcheck).
echo "Gerando o Prisma Client (o volume de node_modules pode ter um client antigo)..."
npx prisma generate
echo "Aplicando migrações..."
npx prisma migrate deploy
echo "Iniciando servidor de desenvolvimento..."
exec npx next dev -H 0.0.0.0 -p 3000
