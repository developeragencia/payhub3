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
 * Cria tabelas e dados iniciais para o banco de dados
 */
export async function setupDatabase() {
  console.log("Iniciando configuração do banco de dados...");
  
  try {
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
      await db.insert(checkouts).values({
        nome: "Checkout Padrão",
        url: "/checkout/curso-marketing",
        produtoId: produto.id,
        layout: "padrao",
        config: { tema: "claro", showLogo: true },
        ativo: true,
        dataCriacao: new Date()
      });
      
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
        ultimaExecucao: null
      });
      console.log("Webhook de demonstração criado");
    } else {
      console.log("Webhooks já existem no banco de dados");
    }
    
    // Verificar se existe alguma transação
    const [existingTransacao] = await db.select().from(transacoes);
    
    if (!existingTransacao) {
      console.log("Criando transação de demonstração...");
      await db.insert(transacoes).values({
        checkoutId: 1,
        clienteNome: "Maria Oliveira",
        clienteEmail: "maria@exemplo.com",
        valor: 1458.90,
        moeda: "BRL",
        status: "aprovado",
        metodo: "Cartão de Crédito",
        referencia: "TRX-78945",
        data: new Date(),
        dataCriacao: new Date(),
        metadata: { origem: "demonstracao" }
      });
      console.log("Transação de demonstração criada");
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
    throw error;
  } finally {
    // Não feche o pool aqui para permitir que o app continue usando
  }
}

// Se executado diretamente (não importado)
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log("Script de configuração concluído");
      pool.end();
      process.exit(0);
    })
    .catch(err => {
      console.error("Erro no script de configuração:", err);
      pool.end();
      process.exit(1);
    });
}