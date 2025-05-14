import express from 'express';
import serverless from 'serverless-http';
import session from 'express-session';
import cors from 'cors';
import { setupAuth } from '../auth-new.js';
import { registerRoutes } from '../server/routes.js';
import { setupDatabase } from '../server/db-setup.js';

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