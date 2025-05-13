import { Router } from "express";
import { storage } from "../storage";
import { insertClienteSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

// Middleware para verificar se o usuário está autenticado
function isAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: "Não autenticado" });
}

// Obter todos os clientes
router.get("/", isAuthenticated, async (req, res) => {
  try {
    // Permite filtrar por usuário ou todos os clientes
    const usuarioId = req.query.usuarioId ? parseInt(req.query.usuarioId as string) : undefined;
    const clientes = await storage.getClientes(usuarioId);
    
    res.json(clientes);
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    res.status(500).json({ message: "Erro ao buscar clientes" });
  }
});

// Obter cliente específico por ID
router.get("/:id", isAuthenticated, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const cliente = await storage.getCliente(id);
    
    if (!cliente) {
      return res.status(404).json({ message: "Cliente não encontrado" });
    }
    
    res.json(cliente);
  } catch (error) {
    console.error("Erro ao buscar cliente:", error);
    res.status(500).json({ message: "Erro ao buscar cliente" });
  }
});

// Criar um novo cliente
router.post("/", isAuthenticated, async (req, res) => {
  try {
    // Validar os dados do cliente
    const clienteData = insertClienteSchema.parse(req.body);
    
    // Verificar se já existe um cliente com o mesmo CPF/CNPJ
    const clienteExistenteCpfCnpj = await storage.getClienteByCpfCnpj(clienteData.cpfCnpj);
    if (clienteExistenteCpfCnpj) {
      return res.status(400).json({ message: "Já existe um cliente com este CPF/CNPJ" });
    }
    
    // Verificar se já existe um cliente com o mesmo email
    const clienteExistenteEmail = await storage.getClienteByEmail(clienteData.email);
    if (clienteExistenteEmail) {
      return res.status(400).json({ message: "Já existe um cliente com este e-mail" });
    }
    
    // Se não existir usuarioId, associa ao usuário logado
    if (!clienteData.usuarioId && req.user?.id) {
      clienteData.usuarioId = req.user.id;
    }
    
    // Criar o cliente
    const novoCliente = await storage.createCliente(clienteData);
    
    // Registra a atividade de criação de cliente
    await storage.createAtividade({
      tipo: "cliente_criado",
      descricao: `Cliente ${novoCliente.nome} criado`,
      data: new Date(),
      icone: "user-add-line",
      cor: "success",
      userId: req.user?.id
    });
    
    res.status(201).json(novoCliente);
  } catch (error) {
    console.error("Erro ao criar cliente:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Dados de cliente inválidos", 
        errors: error.errors 
      });
    }
    res.status(500).json({ message: "Erro ao criar cliente" });
  }
});

// Atualizar cliente existente
router.put("/:id", isAuthenticated, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Verificar se o cliente existe
    const clienteExistente = await storage.getCliente(id);
    if (!clienteExistente) {
      return res.status(404).json({ message: "Cliente não encontrado" });
    }
    
    // Validar os dados de atualização
    const clienteData = insertClienteSchema.partial().parse(req.body);
    
    // Verificar se está tentando atualizar para um CPF/CNPJ já existente
    if (clienteData.cpfCnpj) {
      const clienteCpfCnpj = await storage.getClienteByCpfCnpj(clienteData.cpfCnpj);
      if (clienteCpfCnpj && clienteCpfCnpj.id !== id) {
        return res.status(400).json({ message: "CPF/CNPJ já está sendo usado por outro cliente" });
      }
    }
    
    // Verificar se está tentando atualizar para um email já existente
    if (clienteData.email) {
      const clienteEmail = await storage.getClienteByEmail(clienteData.email);
      if (clienteEmail && clienteEmail.id !== id) {
        return res.status(400).json({ message: "E-mail já está sendo usado por outro cliente" });
      }
    }
    
    // Atualizar o cliente
    const clienteAtualizado = await storage.updateCliente(id, clienteData);
    
    // Registra a atividade de atualização de cliente
    await storage.createAtividade({
      tipo: "cliente_atualizado",
      descricao: `Cliente ${clienteAtualizado?.nome} atualizado`,
      data: new Date(),
      icone: "user-edit-line",
      cor: "primary",
      userId: req.user?.id
    });
    
    res.json(clienteAtualizado);
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Dados de atualização inválidos", 
        errors: error.errors 
      });
    }
    res.status(500).json({ message: "Erro ao atualizar cliente" });
  }
});

// Excluir cliente
router.delete("/:id", isAuthenticated, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Verificar se o cliente existe
    const clienteExistente = await storage.getCliente(id);
    if (!clienteExistente) {
      return res.status(404).json({ message: "Cliente não encontrado" });
    }
    
    // Excluir o cliente
    const sucesso = await storage.deleteCliente(id);
    
    if (sucesso) {
      // Registra a atividade de exclusão de cliente
      await storage.createAtividade({
        tipo: "cliente_excluido",
        descricao: `Cliente ${clienteExistente.nome} excluído`,
        data: new Date(),
        icone: "delete-bin-line",
        cor: "danger",
        userId: req.user?.id
      });
      
      return res.status(200).json({ message: "Cliente excluído com sucesso" });
    } else {
      return res.status(500).json({ message: "Erro ao excluir cliente" });
    }
  } catch (error) {
    console.error("Erro ao excluir cliente:", error);
    res.status(500).json({ message: "Erro ao excluir cliente" });
  }
});

// Busca clientes por CPF/CNPJ ou email
router.get("/busca/avancada", isAuthenticated, async (req, res) => {
  try {
    const { cpfCnpj, email } = req.query;
    
    if (cpfCnpj) {
      const cliente = await storage.getClienteByCpfCnpj(cpfCnpj as string);
      return res.json(cliente ? [cliente] : []);
    }
    
    if (email) {
      const cliente = await storage.getClienteByEmail(email as string);
      return res.json(cliente ? [cliente] : []);
    }
    
    return res.status(400).json({ message: "Informe cpfCnpj ou email para busca" });
  } catch (error) {
    console.error("Erro na busca avançada:", error);
    res.status(500).json({ message: "Erro ao realizar busca" });
  }
});

export default router;