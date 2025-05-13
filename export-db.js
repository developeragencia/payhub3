// Script para exportar dados do banco de dados para arquivos JSON
// Isso ajudará na migração para o ambiente de produção
import { pool } from './server/db.js';
import fs from 'fs';
import path from 'path';

// Diretório onde os dados serão salvos
const DATA_DIR = './db-export';

// Função para garantir que o diretório exista
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Função para exportar uma tabela específica
async function exportTable(tableName) {
  try {
    console.log(`Exportando tabela: ${tableName}`);
    const result = await pool.query(`SELECT * FROM ${tableName}`);
    const filePath = path.join(DATA_DIR, `${tableName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(result.rows, null, 2));
    console.log(`✓ Exportada com sucesso: ${result.rows.length} registros`);
    return result.rows;
  } catch (error) {
    console.error(`Erro ao exportar tabela ${tableName}:`, error);
    return [];
  }
}

// Função principal
async function exportDatabase() {
  ensureDir(DATA_DIR);
  
  const tables = [
    'users',
    'produtos',
    'checkouts',
    'transacoes',
    'webhooks',
    'atividades',
    'clientes'
  ];
  
  for (const table of tables) {
    await exportTable(table);
  }
  
  console.log('Exportação concluída com sucesso!');
  console.log(`Os dados estão disponíveis no diretório: ${DATA_DIR}`);
}

// Executa a exportação
exportDatabase()
  .catch(error => {
    console.error('Erro durante a exportação:', error);
  })
  .finally(() => {
    pool.end();
  });