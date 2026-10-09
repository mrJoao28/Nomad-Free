#!/bin/sh
# Executado apenas na PRIMEIRA inicialização do volume. Cria o banco isolado de testes.
set -e
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<SQL
SELECT 'CREATE DATABASE "${POSTGRES_TEST_DB:-nomadfree_test}"'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${POSTGRES_TEST_DB:-nomadfree_test}')\gexec
SQL
