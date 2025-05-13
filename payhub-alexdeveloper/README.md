# PAYHUB/ALEXDEVELOPER

Um dashboard administrativo brasileiro completo projetado para gerenciamento de produtos, processamento de transações e experiências de checkout avançadas com foco em design de UI moderno e responsivo.

## Tecnologias Utilizadas

- Frontend em React com TypeScript
- Integração de pagamentos com MercadoPago
- Design responsivo e adaptativo
- Suporte à língua portuguesa
- Biblioteca de componentes Shadcn/ui
- Autenticação avançada com layout personalizável
- Gerenciamento de estado com Tanstack React Query

## Configuração e Deploy no Netlify

### Pré-requisitos

- Uma conta no [Netlify](https://www.netlify.com/)
- Um banco de dados PostgreSQL (recomendamos [Neon](https://neon.tech/) ou [Supabase](https://supabase.com/))
- Conta no MercadoPago para processamento de pagamentos

### Passos para Deploy

1. **Configurar Variáveis de Ambiente no Netlify**:

   Acesse o painel do Netlify, vá até "Site settings" > "Environment variables" e adicione as seguintes variáveis:

   ```
   DATABASE_URL=seu_url_de_conexao_postgres
   SESSION_SECRET=uma_chave_secreta_para_sessoes
   MERCADOPAGO_ACCESS_TOKEN=seu_token_mercadopago
   ```

2. **Deploy pelo Netlify**:

   - Conecte o repositório GitHub ao Netlify
   - Use as seguintes configurações:
     - Build command: `npm run build`
     - Publish directory: `dist`
     - Functions directory: `functions`

3. **Configurar DNS**:

   Se você tiver um domínio personalizado, configure-o no Netlify:
   - Vá para "Domain settings"
   - Clique em "Add custom domain"
   - Siga as instruções para configurar os registros DNS

### Deploy Manual

Também é possível fazer deploy manual usando o Netlify CLI:

1. Instale o Netlify CLI:
   ```
   npm install -g netlify-cli
   ```

2. Faça login no Netlify:
   ```
   netlify login
   ```

3. Execute o build:
   ```
   npm run build
   ```

4. Deploy para o Netlify:
   ```
   netlify deploy --prod
   ```

## Estrutura do projeto

O projeto utiliza uma arquitetura moderna de aplicação web:

- `/client`: Código do frontend em React/TypeScript
- `/server`: Backend Express.js
- `/shared`: Schemas compartilhados entre frontend e backend
- `/functions`: Funções serverless para deploy no Netlify

## Funcionalidades

- Dashboard admin e padrão
- Gestão de produtos
- Configuração de checkout
- Geração de links de pagamento
- Acompanhamento de transações
- Webhook para notificações de pagamento
- Gerenciamento de clientes
- Relatórios e estatísticas

## Acesso ao Sistema

- **Usuário**: admin
- **Senha**: admin123

## Suporte

Em caso de dúvidas ou problemas, entre em contato com o desenvolvedor.