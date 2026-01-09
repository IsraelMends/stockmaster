# Dockerfile para o Backend

FROM node:20-alpine

WORKDIR /app

# Instalar dependências do sistema necessárias para Prisma
RUN apk add --no-cache openssl

# Copiar todos os arquivos necessários
COPY package.json ./
COPY package-lock.json ./

# Instalar dependências
RUN npm install

# Copiar o resto do código
COPY . .

# Gerar Prisma Client
RUN npx prisma generate

# Build da aplicação
RUN npm run build

# Expor porta
EXPOSE 3333

# Comando para iniciar
CMD ["npm", "start"]
