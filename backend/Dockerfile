# Dockerfile para o Backend

FROM node:20-alpine

WORKDIR /app

# Instalar dependências do sistema necessárias para Prisma
RUN apk add --no-cache openssl

# Copiar package.json
COPY package.json ./

# Instalar dependências (npm install funciona com ou sem package-lock.json)
RUN npm install

# Copiar o resto do código
COPY . .

# Gerar Prisma Client (usa DATABASE_URL temporária apenas para validação)
# O Prisma precisa da URL para validar o schema, mas não precisa estar conectado
RUN DATABASE_URL="postgresql://user:password@localhost:5432/db?schema=public" npx prisma generate

# Build da aplicação
RUN npm run build

# Copiar Prisma Client gerado para dist (necessário para runtime)
RUN cp -r src/generated dist/generated

# Expor porta
EXPOSE 3333

# Comando para iniciar
CMD ["npm", "start"]
