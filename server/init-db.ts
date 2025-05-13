import { runMigrations } from './migrate';
import { setupDatabase } from './db-setup';

/**
 * Inicializa o banco de dados completamente
 * 1. Executa as migrações (cria tabelas)
 * 2. Configura dados iniciais
 */
async function initDatabase() {
  try {
    console.log("==== INICIANDO CONFIGURAÇÃO COMPLETA DO BANCO DE DADOS ====");
    
    // Primeiro executa migrações (cria tabelas)
    console.log("\n==== EXECUTANDO MIGRAÇÕES ====");
    await runMigrations();
    
    // Depois configura dados iniciais
    console.log("\n==== CONFIGURANDO DADOS INICIAIS ====");
    await setupDatabase();
    
    console.log("\n==== CONFIGURAÇÃO DO BANCO DE DADOS CONCLUÍDA COM SUCESSO ====");
    return true;
  } catch (error) {
    console.error("Erro durante inicialização do banco de dados:", error);
    return false;
  }
}

// Se executado diretamente (não importado)
if (require.main === module) {
  initDatabase()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(() => {
      process.exit(1);
    });
}

export { initDatabase };