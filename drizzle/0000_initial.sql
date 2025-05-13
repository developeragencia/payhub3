CREATE TABLE IF NOT EXISTS "users" (
  "id" SERIAL PRIMARY KEY,
  "username" TEXT NOT NULL UNIQUE,
  "password" TEXT NOT NULL,
  "nome" TEXT,
  "email" TEXT,
  "role" TEXT DEFAULT 'user',
  "avatar" TEXT,
  "dataCriacao" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "produtos" (
  "id" SERIAL PRIMARY KEY,
  "nome" TEXT NOT NULL,
  "descricao" TEXT,
  "preco" DECIMAL(10, 2) NOT NULL,
  "imagem" TEXT,
  "categoria" TEXT,
  "ativo" BOOLEAN DEFAULT true,
  "dataCriacao" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "checkouts" (
  "id" SERIAL PRIMARY KEY,
  "nome" TEXT NOT NULL,
  "url" TEXT,
  "produtoId" INTEGER NOT NULL REFERENCES "produtos"("id"),
  "layout" TEXT DEFAULT 'padrao',
  "config" JSONB DEFAULT '{}',
  "ativo" BOOLEAN DEFAULT true,
  "dataCriacao" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "transacoes" (
  "id" SERIAL PRIMARY KEY,
  "checkoutId" INTEGER REFERENCES "checkouts"("id"),
  "clienteNome" TEXT,
  "clienteEmail" TEXT,
  "valor" DECIMAL(10, 2) NOT NULL,
  "moeda" TEXT DEFAULT 'BRL',
  "status" TEXT NOT NULL,
  "metodo" TEXT,
  "referencia" TEXT,
  "data" TIMESTAMP,
  "dataCriacao" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "metadata" JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS "webhooks" (
  "id" SERIAL PRIMARY KEY,
  "evento" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "ativo" BOOLEAN DEFAULT true,
  "ultimoStatus" INTEGER,
  "ultimaExecucao" TIMESTAMP,
  "dataCriacao" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "atividades" (
  "id" SERIAL PRIMARY KEY,
  "tipo" TEXT NOT NULL,
  "descricao" TEXT NOT NULL,
  "icone" TEXT,
  "cor" TEXT,
  "userId" INTEGER REFERENCES "users"("id"),
  "data" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);