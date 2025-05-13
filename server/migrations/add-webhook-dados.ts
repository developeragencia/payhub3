import { db, pool } from "../db";
import { sql } from "drizzle-orm";

/**
 * Função para adicionar colunas que faltam em tabelas existentes
 */
export async function addWebhookDadosColumn() {
  console.log("Migrando tabela de webhooks - adicionando coluna dados...");
  
  try {
    // Verifica se a coluna 'dados' existe na tabela 'webhooks'
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'webhooks' AND column_name = 'dados'
    `;
    
    const result = await pool.query(checkColumnQuery);
    
    // Se a coluna não existir, adiciona
    if (result.rows.length === 0) {
      await pool.query(`
        ALTER TABLE webhooks
        ADD COLUMN IF NOT EXISTS dados JSONB
      `);
      console.log("Coluna 'dados' adicionada à tabela 'webhooks'");
    } else {
      console.log("Coluna 'dados' já existe na tabela 'webhooks'");
    }
    
    return true;
  } catch (error) {
    console.error("Erro ao adicionar coluna 'dados' à tabela 'webhooks':", error);
    throw error;
  }
}

/**
 * Função para adicionar coluna metadados à tabela de atividades
 */
export async function addAtividadesMetadadosColumn() {
  console.log("Migrando tabela de atividades - adicionando coluna metadados...");
  
  try {
    // Verifica se a coluna 'metadados' existe na tabela 'atividades'
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'atividades' AND column_name = 'metadados'
    `;
    
    const result = await pool.query(checkColumnQuery);
    
    // Se a coluna não existir, adiciona
    if (result.rows.length === 0) {
      await pool.query(`
        ALTER TABLE atividades
        ADD COLUMN IF NOT EXISTS metadados JSONB
      `);
      console.log("Coluna 'metadados' adicionada à tabela 'atividades'");
    } else {
      console.log("Coluna 'metadados' já existe na tabela 'atividades'");
    }
    
    return true;
  } catch (error) {
    console.error("Erro ao adicionar coluna 'metadados' à tabela 'atividades':", error);
    throw error;
  }
}

/**
 * Função para adicionar coluna dataCriacao à tabela de atividades se não existir
 */
export async function addAtividadesDataCriacaoColumn() {
  console.log("Migrando tabela de atividades - adicionando coluna dataCriacao...");
  
  try {
    // Verifica se a coluna 'dataCriacao' existe na tabela 'atividades'
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'atividades' AND column_name = 'dataCriacao'
    `;
    
    const result = await pool.query(checkColumnQuery);
    
    // Se a coluna não existir, adiciona
    if (result.rows.length === 0) {
      await pool.query(`
        ALTER TABLE atividades
        ADD COLUMN IF NOT EXISTS "dataCriacao" TIMESTAMP DEFAULT NOW()
      `);
      console.log("Coluna 'dataCriacao' adicionada à tabela 'atividades'");
    } else {
      console.log("Coluna 'dataCriacao' já existe na tabela 'atividades'");
    }
    
    return true;
  } catch (error) {
    console.error("Erro ao adicionar coluna 'dataCriacao' à tabela 'atividades':", error);
    throw error;
  }
}

/**
 * Executa todas as migrações
 */
export async function runAllMigrations() {
  try {
    await addWebhookDadosColumn();
    await addAtividadesMetadadosColumn();
    await addAtividadesDataCriacaoColumn();
    console.log("Todas as migrações foram executadas com sucesso!");
    return true;
  } catch (error) {
    console.error("Erro ao executar migrações:", error);
    throw error;
  }
}