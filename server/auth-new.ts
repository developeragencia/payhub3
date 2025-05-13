import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  if (!process.env.SESSION_SECRET) {
    // Para desenvolvimento, usar um segredo padrão.
    // Em produção, isso deve ser configurado como uma variável de ambiente.
    process.env.SESSION_SECRET = "desenvolvimento-secret-mercadopagoadmin2025";
  }

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000 // 24 horas
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        console.log(`Tentativa de login para usuário: ${username}`);
        const user = await storage.getUserByUsername(username);
        
        if (!user) {
          console.log(`Usuário não encontrado: ${username}`);
          return done(null, false, { message: "Usuário não encontrado" });
        }
        
        // Para o primeiro login com o usuário admin, verifica se a senha é um texto plano 
        // (antes de ser convertida para hash)
        if (user.username === "admin" && user.password === "admin123") {
          console.log("Primeiro login detectado. Atualizando senha para hash.");
          // Atualizar a senha para formato hash e dar sucesso no login
          const hashedPassword = await hashPassword("admin123");
          await storage.updateUser(user.id, { 
            password: hashedPassword
          });
          user.password = hashedPassword;
          return done(null, user);
        }
        
        // Verificação normal usando comparePasswords
        if (await comparePasswords(password, user.password)) {
          console.log(`Login bem-sucedido para: ${username}`);
          return done(null, user);
        } else {
          console.log(`Senha inválida para: ${username}`);
          return done(null, false, { message: "Senha inválida" });
        }
      } catch (error) {
        console.error("Erro durante autenticação:", error);
        return done(error);
      }
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Nome de usuário já existe" });
      }

      // Hash da senha antes de armazenar
      const hashedPassword = await hashPassword(req.body.password);
      
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword
      });

      // Registra atividade
      await storage.createAtividade({
        tipo: "usuario",
        descricao: `Novo usuário criado - ${user.nome}`,
        icone: "user-add-line",
        cor: "primary",
        userId: null
      });

      // Auto-login após registro
      req.login(user, (err) => {
        if (err) return next(err);
        return res.status(201).json(user);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", async (err: Error, user: Express.User, info: any) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: info?.message || "Falha na autenticação" });
      }
      
      req.login(user, async (err) => {
        if (err) return next(err);
        
        // Registra atividade de login
        await storage.createAtividade({
          tipo: "login",
          descricao: `Login realizado - ${user.nome}`,
          icone: "login-box-line",
          cor: "primary",
          userId: user.id
        });
        
        return res.status(200).json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    if (req.user) {
      const userId = req.user.id;
      const userName = req.user.nome;
      
      req.logout((err) => {
        if (err) return next(err);
        
        // Após logout bem-sucedido, registre a atividade
        storage.createAtividade({
          tipo: "logout",
          descricao: `Logout realizado - ${userName}`,
          icone: "logout-box-line",
          cor: "secondary",
          userId: userId
        }).catch(console.error); // Tratamento assíncrono de erro
        
        res.status(200).json({ message: "Logout realizado com sucesso" });
      });
    } else {
      res.status(200).json({ message: "Nenhuma sessão ativa" });
    }
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }
    res.json(req.user);
  });
}