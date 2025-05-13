#!/bin/bash

# Script para preparar o projeto para o Netlify
echo "Preparando projeto PAYHUB/ALEXDEVELOPER para Netlify..."

# Criar diretório de funções se necessário
mkdir -p .netlify/functions

# Construir o frontend com Vite
echo "Construindo o frontend..."
npm run build

# Preparar funções serverless
echo "Preparando funções serverless..."
esbuild functions/api.js --platform=node --packages=external --bundle --format=esm --outdir=.netlify/functions

echo "Construção concluída! Os arquivos estão prontos para deploy no Netlify."