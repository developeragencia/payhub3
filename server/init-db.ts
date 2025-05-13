import { runMigrations } from './migrate';
import { setupDatabase } from './db-setup';
import { runAllMigrations } from './migrations/add-webhook-dados';

/**
 * Inicializa o banco de dados completamente
 * 1. Executa as migrações (cria tabelas)
 * 2. Executa migrações de alteração de schema
 * 3. Configura dados iniciais
 */
async function initDatabase() {
  try {
    console.log("==== INICIANDO CONFIGURAÇÃO COMPLETA DO BANCO DE DADOS ====");
    
    // Primeiro executa migrações (cria tabelas)
    console.log("\n==== EXECUTANDO MIGRAÇÕES ====");
    await runMigrations();
    
    // Executa migrações para adicionar novas colunas
    console.log("\n==== EXECUTANDO MIGRAÇÕES DE ESQUEMA ====");
    await runAllMigrations();
    
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

// Em módulos ES, não temos acesso a require.main
// Vamos executar o código sempre que o módulo for importado
initDatabase()
  .then(success => {
    console.log("Inicialização do banco de dados:", success ? "Sucesso" : "Falha");
  })
  .catch((error) => {
    console.error("Erro fatal na inicialização do banco de dados:", error);
  });

export { initDatabase };