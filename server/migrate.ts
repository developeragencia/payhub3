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
    // Criar tabelas do schema
    await migrate(db, { migrationsFolder: "drizzle" });
    console.log("Migrações concluídas com sucesso!");
  } catch (error) {
    console.error("Erro ao executar migrações:", error);
    throw error;
  } finally {
    await sql.end();
  }
}

// Se executado diretamente
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log("Script de migração concluído");
      process.exit(0);
    })
    .catch(err => {
      console.error("Erro no script de migração:", err);
      process.exit(1);
    });
}

export { runMigrations };