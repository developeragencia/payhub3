#!/bin/bash

# Script para preparar o PAYHUB/ALEXDEVELOPER para deploy no Netlify

echo "=== PREPARANDO PROJETO PAYHUB/ALEXDEVELOPER PARA DEPLOY NO NETLIFY ==="
echo ""

# Passo 1: Exportar dados do banco de dados
echo "Passo 1: Exportando dados do banco de dados..."
mkdir -p db-export
node export-db.js
echo ""

# Passo 2: Construir o projeto para produção
echo "Passo 2: Construindo o projeto para produção..."
npm run build
echo ""

# Passo 3: Verificar configurações do Netlify
echo "Passo 3: Verificando configurações do Netlify..."
if [ -f "netlify.toml" ]; then
  echo "✓ Arquivo netlify.toml encontrado"
else
  echo "✗ Arquivo netlify.toml não encontrado"
  exit 1
fi

if [ -f "_redirects" ]; then
  echo "✓ Arquivo _redirects encontrado"
  # Copiar _redirects para a pasta de build
  cp _redirects dist/
  echo "  ↳ Copiado para pasta dist/"
else
  echo "✗ Arquivo _redirects não encontrado"
  exit 1
fi

# Passo 4: Verificar as funções do Netlify
echo "Passo 4: Verificando funções do Netlify..."
if [ -d "functions" ]; then
  echo "✓ Diretório de funções encontrado"
  # Verificar arquivo principal da API
  if [ -f "functions/api.js" ]; then
    echo "✓ Função API encontrada"
  else
    echo "✗ Função API não encontrada"
    exit 1
  fi
else
  echo "✗ Diretório de funções não encontrado"
  exit 1
fi

# Passo 5: Preparar .netlify
echo "Passo 5: Preparando diretório .netlify..."
mkdir -p .netlify/functions
echo ""

# Passo 6: Construir as funções
echo "Passo 6: Construindo funções serverless..."
npx esbuild functions/api.js --platform=node --packages=external --bundle --format=esm --outdir=.netlify/functions
echo ""

echo "=== PREPARAÇÃO CONCLUÍDA! ==="
echo "O projeto está pronto para deploy no Netlify."
echo "Arquivos importantes:"
echo "- dist/: Pasta do front-end"
echo "- .netlify/functions/: Pasta de funções serverless"
echo "- db-export/: Exportação do banco de dados"
echo ""
echo "Para fazer o deploy, use o Netlify CLI ou faça o upload manual dos arquivos."
echo "=== OBRIGADO POR USAR PAYHUB/ALEXDEVELOPER! ==="