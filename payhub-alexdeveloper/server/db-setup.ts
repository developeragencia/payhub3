import { db, pool } from "./db";
import { hashPassword } from "./auth-utils";
import {
  users,
  produtos,
  checkouts,
  transacoes,
  webhooks,
  atividades
} from "@shared/schema";
import { eq } from "drizzle-orm";

/**
 * Verifica se uma tabela existe no banco de dados
 */
async function tableExists(tableName: string): Promise<boolean> {
  try {
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      );
    `, [tableName]);
    
    return result.rows[0].exists;
  } catch (error) {
    console.error(`Erro ao verificar se a tabela ${tableName} existe:`, error);
    return false;
  }
}

/**
 * Cria tabelas e dados iniciais para o banco de dados
 */
export async function setupDatabase() {
  console.log("Iniciando configuração do banco de dados...");
  
  try {
    // Verificar se as tabelas existem
    const usersTableExists = await tableExists('users');
    const produtosTableExists = await tableExists('produtos');
    const checkoutsTableExists = await tableExists('checkouts');
    const webhooksTableExists = await tableExists('webhooks');
    const transacoesTableExists = await tableExists('transacoes');
    const atividadesTableExists = await tableExists('atividades');
    
    if (!usersTableExists || !produtosTableExists || !checkoutsTableExists || 
        !webhooksTableExists || !transacoesTableExists || !atividadesTableExists) {
      console.log("Uma ou mais tabelas não existem. Aguarde enquanto as migrações são concluídas.");
      // Retornar sem fazer mais nada, pois as tabelas ainda serão criadas pelo processo de migração
      return;
    }
    
    console.log("Tabelas existem, configurando dados iniciais...");
    
    // Verificar se o usuário admin já existe
    const [existingAdmin] = await db.select().from(users).where(eq(users.username, "admin"));
    
    if (!existingAdmin) {
      console.log("Criando usuário admin...");
      // Criar usuário admin com senha hasheada
      const hashedPassword = await hashPassword("admin123");
      await db.insert(users).values({
        username: "admin",
        password: hashedPassword,
        nome: "Administrador",
        email: "admin@exemplo.com",
        role: "admin",
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Admin"
      });
      console.log("Usuário admin criado com sucesso");
    } else {
      console.log("Usuário admin já existe");
    }
    
    // Verificar se existe algum produto
    const [existingProduto] = await db.select().from(produtos);
    
    if (!existingProduto) {
      console.log("Criando produto de demonstração...");
      const [produto] = await db.insert(produtos).values({
        nome: "Curso de Marketing Digital",
        descricao: "Curso completo sobre marketing digital e estratégias de vendas",
        preco: 199.90,
        imagem: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        categoria: "Cursos",
        ativo: true
      }).returning();
      
      // Criar checkout para o produto
      // Usando SQL direto para evitar problemas com colunas em camelCase
      await pool.query(`
        INSERT INTO checkouts (nome, url, "produtoId", layout, config, ativo, "dataCriacao") 
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        "Checkout Padrão",
        "/checkout/curso-marketing",
        produto.id,
        "padrao",
        JSON.stringify({ tema: "claro", showLogo: true }),
        true,
        new Date()
      ]);
      
      console.log("Produto e checkout de demonstração criados");
    } else {
      console.log("Produtos já existem no banco de dados");
    }
    
    // Verificar se existe algum webhook
    const [existingWebhook] = await db.select().from(webhooks);
    
    if (!existingWebhook) {
      console.log("Criando webhook de demonstração...");
      await db.insert(webhooks).values({
        evento: "payment.processed",
        url: "https://api.seusite.com.br/webhooks/payments",
        ativo: true,
        ultimoStatus: null,
        ultimaExecucao: null,
        dataCriacao: new Date()
      });
      console.log("Webhook de demonstração criado");
    } else {
      console.log("Webhooks já existem no banco de dados");
    }
    
    // Verificar se existe alguma transação
    const [existingTransacao] = await db.select().from(transacoes);
    
    if (!existingTransacao) {
      console.log("Criando transação de demonstração...");
      
      // Verificar se já existe algum checkout para associar
      const [checkout] = await db.select().from(checkouts);
      
      if (checkout) {
        // Usando SQL direto para evitar problemas com colunas em camelCase
        await pool.query(`
          INSERT INTO transacoes ("checkoutId", "clienteNome", "clienteEmail", valor, moeda, status, metodo, referencia, data, "dataCriacao", metadata) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [
          checkout.id,
          "Maria Oliveira",
          "maria@exemplo.com",
          1458.90,
          "BRL",
          "aprovado",
          "Cartão de Crédito",
          "TRX-78945",
          new Date(),
          new Date(),
          JSON.stringify({ origem: "demonstracao" })
        ]);
        console.log("Transação de demonstração criada");
      } else {
        console.log("Não foi possível criar transação - nenhum checkout encontrado");
      }
    } else {
      console.log("Transações já existem no banco de dados");
    }
    
    // Verificar se existe alguma atividade
    const [existingAtividade] = await db.select().from(atividades);
    
    if (!existingAtividade) {
      console.log("Criando atividades de demonstração...");
      
      // Criar atividades de exemplo
      await db.insert(atividades).values([
        {
          tipo: "usuario",
          descricao: "Novo cliente registrado - Carlos Santos se registrou no sistema",
          icone: "user-add-line",
          cor: "primary",
          userId: null,
          data: new Date(Date.now() - 3600000 * 24 * 2) // 2 dias atrás
        },
        {
          tipo: "transacao",
          descricao: "Transação concluída - Transação #TRX-78945 foi concluída com sucesso",
          icone: "checkbox-circle-line",
          cor: "success",
          userId: null,
          data: new Date(Date.now() - 3600000 * 8) // 8 horas atrás
        },
        {
          tipo: "sistema",
          descricao: "Notificação de sistema - Atualização de sistema programada para 20/05/2023",
          icone: "error-warning-line",
          cor: "warning",
          userId: null,
          data: new Date(Date.now() - 3600000) // 1 hora atrás
        }
      ]);
      
      console.log("Atividades de demonstração criadas");
    } else {
      console.log("Atividades já existem no banco de dados");
    }
    
    console.log("Configuração do banco de dados concluída com sucesso!");
    
  } catch (error) {
    console.error("Erro durante a configuração do banco de dados:", error);
    // Não lançar erro aqui, apenas logar, para que o aplicativo continue
    // mesmo que não consiga configurar os dados iniciais
  } finally {
    // Não feche o pool aqui para permitir que o app continue usando
  }
}

// Em módulos ES, executamos independentemente de como o arquivo é chamado
// Não precisamos fazer verificação de módulo principal
setupDatabase()
  .then(() => {
    console.log("Script de configuração concluído");
  })
  .catch(err => {
    console.error("Erro no script de configuração:", err);
  });