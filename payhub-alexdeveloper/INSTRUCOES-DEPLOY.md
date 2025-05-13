# PAYHUB/ALEXDEVELOPER - INSTRUÇÕES DE DEPLOY

Este arquivo contém instruções passo a passo para hospedar o projeto PAYHUB/ALEXDEVELOPER no Netlify.

## Visão Geral

O PAYHUB é um dashboard administrativo brasileiro completo para gerenciamento de produtos, processamento de transações, e experiências de checkout avançadas. O projeto utiliza:

- Frontend: React com TypeScript
- Backend: Express.js com API serverless para Netlify
- Banco de dados: PostgreSQL
- Pagamentos: Integração com MercadoPago

## Arquivos importantes

- `netlify.toml`: Configuração do Netlify
- `.env.example`: Variáveis de ambiente necessárias
- `functions/`: APIs serverless
- `build-netlify.sh`: Script para build
- `prepare-deploy.sh`: Script para preparar deploy

## Passo a Passo para Deploy no Netlify

### 1. Preparação Inicial

1. Extraia todos os arquivos deste pacote para uma pasta em sua máquina.
2. Instale as dependências:
   ```
   npm install
   ```
3. Crie um arquivo `.env` baseado no `.env.example` e preencha as variáveis.

### 2. Configuração do Banco de Dados

1. Crie um banco de dados PostgreSQL em um serviço como:
   - [Neon](https://neon.tech) (recomendado)
   - [Supabase](https://supabase.com)
   - [ElephantSQL](https://www.elephantsql.com)

2. Anote a string de conexão, você precisará dela para o Netlify.

### 3. Build Local

1. Execute o build do projeto:
   ```
   npm run build
   ```

2. OU use o script de build fornecido:
   ```
   ./build-netlify.sh
   ```

3. Verifique se as pastas `dist` e `.netlify/functions` foram criadas corretamente.

### 4. Deploy no Netlify via Interface Web

1. Faça login no [Netlify](https://app.netlify.com)
2. Clique em "New site from Git"
3. Conecte seu repositório GitHub (se tiver feito upload do código)
   OU use a opção de upload manual:
   - Clique em "Deploy manually"
   - Arraste a pasta `dist` para o campo de upload

4. Configure as variáveis de ambiente:
   - Vá para "Site settings" > "Environment variables"
   - Adicione todas as variáveis listadas no arquivo `.env.example`
   - IMPORTANTE: Certifique-se de adicionar DATABASE_URL com a string de conexão do seu banco

5. Configure as funções do Netlify:
   - Vá para "Functions" > "Settings"
   - Defina o diretório de funções como `functions`

### 5. Deploy via Netlify CLI (Alternativa)

1. Instale o Netlify CLI:
   ```
   npm install -g netlify-cli
   ```

2. Faça login:
   ```
   netlify login
   ```

3. Inicialize o site:
   ```
   netlify init
   ```

4. Deploy:
   ```
   netlify deploy --prod
   ```

### 6. Após o Deploy

1. Acesse seu site em [seu-site].netlify.app
2. Faça login com:
   - Usuário: `admin`
   - Senha: `admin123`
3. Configure seus produtos e integrações com MercadoPago

## Solução de Problemas

- Se as funções serverless não funcionarem, verifique se você configurou corretamente o diretório de funções no Netlify.
- Se o banco de dados não conectar, verifique a variável `DATABASE_URL` nas configurações do Netlify.
- Para problemas de CORS, verifique a configuração em `functions/api.js`.

## Recursos Adicionais

Consulte o arquivo `netlify-build-instructions.md` para informações mais detalhadas sobre o processo de deploy.

---

Para mais informações ou suporte, entre em contato.

PAYHUB/ALEXDEVELOPER - © 2023