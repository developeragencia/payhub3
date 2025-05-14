import express from 'express';
import serverless from 'serverless-http';
import session from 'express-session';
import cors from 'cors';
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { storage } from './storage.js';
import { hashPassword, comparePasswords } from './auth-utils.js';
import { registerRoutes } from './routes.js';
import { setupDatabase } from './db-setup.js';

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://payhub-alexdeveloper.netlify.app', 'https://www.payhub-alexdeveloper.netlify.app'] 
    : 'http://localhost:5000',
  credentials: true
}));

// Configurar sessão e autenticação
const sessionSettings = {
  secret: process.env.SESSION_SECRET || 'payhub-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 1000 * 60 * 60 * 24 // 24 horas
  }
};

app.use(session(sessionSettings));

// Setup auth e routes
function setupAuth(app) {
  if (!process.env.SESSION_SECRET) {
    process.env.SESSION_SECRET = "desenvolvimento-secret-mercadopagoadmin2025";
  }
  const sessionSettings = {
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
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Usuário não encontrado" });
        }
        if (user.username === "admin" && user.password === "admin123") {
          const hashedPassword = await hashPassword("admin123");
          await storage.updateUser(user.id, { password: hashedPassword });
          user.password = hashedPassword;
          return done(null, user);
        }
        if (await comparePasswords(password, user.password)) {
          return done(null, user);
        } else {
          return done(null, false, { message: "Senha inválida" });
        }
      } catch (error) {
        return done(error);
      }
    })
  );
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser(async (id, done) => {
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
      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({ ...req.body, password: hashedPassword });
      await storage.createAtividade({
        tipo: "usuario",
        descricao: `Novo usuário criado - ${user.nome}`,
        icone: "user-add-line",
        cor: "primary",
        userId: null
      });
      req.login(user, (err) => {
        if (err) return next(err);
        return res.status(201).json(user);
      });
    } catch (error) {
      next(error);
    }
  });
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", async (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: info?.message || "Falha na autenticação" });
      }
      req.login(user, async (err) => {
        if (err) return next(err);
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
        storage.createAtividade({
          tipo: "logout",
          descricao: `Logout realizado - ${userName}`,
          icone: "logout-box-line",
          cor: "secondary",
          userId: userId
        }).catch(console.error);
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

setupAuth(app);
registerRoutes(app);

// Inicializar banco de dados
(async function() {
  try {
    await setupDatabase();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
})();

// Middleware para erros
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Exportar como função serverless
export const handler = serverless(app);