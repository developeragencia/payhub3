# Instruções para Build e Deploy no Netlify

Este documento fornece instruções detalhadas para construir e implantar o projeto PAYHUB/ALEXDEVELOPER no Netlify.

## Pré-requisitos

1. Conta no Netlify
2. Git instalado localmente
3. Node.js versão 18 ou superior
4. Banco de dados PostgreSQL (preferencialmente Neon ou Supabase)

## Arquivos de Configuração

Os seguintes arquivos de configuração foram criados para facilitar o deploy no Netlify:

- `netlify.toml`: Configuração principal do Netlify
- `_redirects`: Regras de redirecionamento
- `functions/api.js`: Função serverless para backend
- `functions/_db-helper.js`: Utilitário para conexão com o banco de dados
- `.env.example`: Exemplo de variáveis de ambiente necessárias

## Passo a Passo para Build Local

1. Clone o repositório:
   ```
   git clone https://github.com/seu-usuario/payhub-alexdeveloper.git
   cd payhub-alexdeveloper
   ```

2. Instale as dependências:
   ```
   npm install
   ```

3. Configure as variáveis de ambiente:
   ```
   cp .env.example .env
   ```
   Edite o arquivo `.env` e adicione as informações corretas.

4. Execute o build:
   ```
   npm run build
   ```

5. Verifique se a pasta `dist` foi criada corretamente:
   ```
   ls -la dist
   ```

6. Construa as funções serverless:
   ```
   mkdir -p .netlify/functions
   npx esbuild functions/api.js --platform=node --packages=external --bundle --format=esm --outdir=.netlify/functions
   ```

7. Copie o arquivo `_redirects` para a pasta `dist`:
   ```
   cp _redirects dist/
   ```

## Deploy no Netlify

### Opção 1: Deploy via UI

1. Faça login no Netlify
2. Clique em "New site from Git"
3. Selecione o repositório do GitHub
4. Configure as opções de build:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `functions`
5. Configure as variáveis de ambiente necessárias (conforme .env.example)
6. Clique em "Deploy site"

### Opção 2: Deploy via CLI

1. Instale o Netlify CLI:
   ```
   npm install -g netlify-cli
   ```

2. Faça login no Netlify:
   ```
   netlify login
   ```

3. Inicialize o site do Netlify:
   ```
   netlify init
   ```

4. Execute o deploy:
   ```
   netlify deploy --prod
   ```

## Variáveis de Ambiente Necessárias

Configure estas variáveis de ambiente no Netlify antes do deploy:

- `DATABASE_URL`: URL de conexão com o banco de dados PostgreSQL
- `SESSION_SECRET`: Uma string aleatória para criptografia de sessão
- `MERCADOPAGO_ACCESS_TOKEN`: Token de acesso do MercadoPago
- `MERCADOPAGO_PUBLIC_KEY`: Chave pública do MercadoPago
- `APP_URL`: URL do seu aplicativo (ex: https://payhub-alexdeveloper.netlify.app)
- `WEBHOOK_URL`: URL para webhook (ex: https://payhub-alexdeveloper.netlify.app/.netlify/functions/api/webhook)

## Banco de Dados

É necessário configurar um banco de dados PostgreSQL externo. Recomendamos serviços como:

1. [Neon](https://neon.tech) - Banco de dados PostgreSQL serverless
2. [Supabase](https://supabase.com) - Plataforma com PostgreSQL incluído
3. [ElephantSQL](https://www.elephantsql.com) - PostgreSQL como serviço

Após criar o banco de dados, copie a string de conexão e configure-a como variável de ambiente `DATABASE_URL` no Netlify.

## Após o Deploy

1. Verifique os logs do Netlify para garantir que tudo está funcionando
2. Acesse seu aplicativo em https://payhub-alexdeveloper.netlify.app (ou o domínio configurado)
3. Faça login com o usuário admin e senha admin123
4. Configure as integrações com MercadoPago

## Solução de Problemas

- Se as funções serverless não estiverem funcionando, verifique os logs do Netlify
- Se o banco de dados não conectar, certifique-se de que a variável `DATABASE_URL` está correta
- Para problemas de CORS, verifique a configuração em `functions/api.js`

## Recursos Adicionais

- [Documentação Netlify Functions](https://docs.netlify.com/functions/overview/)
- [Guia de Deploy do Netlify](https://docs.netlify.com/site-deploys/overview/)
- [Documentação do MercadoPago](https://www.mercadopago.com.br/developers/)
- [Drizzle ORM](https://orm.drizzle.team)