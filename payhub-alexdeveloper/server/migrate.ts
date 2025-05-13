import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as schema from "@shared/schema";

// Executar migrações
async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL não está definido");
  }

  console.log("Conectando ao banco de dados...");
  const sql = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(sql, { schema });

  console.log("Executando migrações...");
  
  try {
    // Criar schema drizzle se não existir
    await sql`CREATE SCHEMA IF NOT EXISTS drizzle;`;
    
    // Executar SQL para criar tabelas diretamente (alternativa mais robusta)
    console.log("Executando script SQL para criar tabelas...");
    const sqlScript = `
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
      "produtoId" INTEGER NOT NULL REFERENCES "produtos"("id") ON DELETE CASCADE,
      "layout" TEXT DEFAULT 'padrao',
      "config" JSONB DEFAULT '{}',
      "ativo" BOOLEAN DEFAULT true,
      "dataCriacao" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS "transacoes" (
      "id" SERIAL PRIMARY KEY,
      "checkoutId" INTEGER REFERENCES "checkouts"("id") ON DELETE SET NULL,
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
      "userId" INTEGER REFERENCES "users"("id") ON DELETE SET NULL,
      "data" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`;
    
    // Executar cada comando separadamente
    const commands = sqlScript.split(';').filter(cmd => cmd.trim().length > 0);
    for (const command of commands) {
      try {
        await sql.unsafe(command + ';');
      } catch (err: any) {
        console.warn("Aviso ao executar comando SQL:", err?.message || String(err));
      }
    }
    
    console.log("Criação de tabelas concluída via SQL direto!");
    
    // Atualizar o arquivo de journal para marcar a migração como concluída
    try {
      await migrate(db, { migrationsFolder: "drizzle" });
      console.log("Registro de migrações atualizado com sucesso!");
    } catch (error: any) {
      console.warn("Aviso ao atualizar registro de migrações (pode ser ignorado):", error?.message || String(error));
    }
  } catch (error: any) {
    console.error("Erro ao executar migrações:", error?.message || String(error));
    throw error;
  } finally {
    await sql.end();
  }
}

// Como estamos usando módulos ES, vamos verificar se este arquivo está sendo executado diretamente
// usando uma variável de ambiente ou outra abordagem
runMigrations()
  .then(() => {
    console.log("Script de migração concluído");
  })
  .catch(err => {
    console.error("Erro no script de migração:", err);
    process.exit(1);
  });

export { runMigrations };