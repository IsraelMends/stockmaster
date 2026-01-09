# Dockerfile para o Backend

FROM node:20-alpine

WORKDIR /app

# Instalar dependências do sistema necessárias para Prisma
RUN apk add --no-cache openssl

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências (incluindo devDependencies para build)
RUN npm ci

# Copiar tudo de uma vez (incluindo prisma e código)
COPY . .

# Gerar Prisma Client
RUN npx prisma generate

# Build da aplicação
RUN npm run build

# Expor porta
EXPOSE 3333

# Comando para iniciar
CMD ["npm", "start"]
