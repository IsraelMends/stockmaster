# 🚂 Deploy no Railway - Guia Completo

Este guia vai te ajudar a fazer o deploy completo do StockMaster no Railway.

---

## 📋 Pré-requisitos

- ✅ Conta no GitHub com o código do projeto
- ✅ Conta no Railway (https://railway.app)
- ✅ Banco de dados configurado (Supabase ou PostgreSQL do Railway)

---

## 🎯 Opção 1: Usar Supabase (Recomendado)

Você já configurou o Supabase! Vamos usar ele no Railway.

### Passo 1: Preparar o Código no GitHub

```bash
# Certifique-se que está na raiz do projeto
cd /Users/isra_dev/Desktop/Code/stockmaster

# Verifique o status do git
git status

# Se necessário, adicione e commite as mudanças
git add .
git commit -m "Configuração para deploy no Railway"

# Se ainda não tem remote, adicione:
# git remote add origin https://github.com/SEU-USUARIO/stockmaster.git
# git push -u origin main
```

### Passo 2: Criar Projeto no Railway

1. Acesse: **https://railway.app**
2. Faça login com **GitHub**
3. Clique em **"New Project"**
4. Selecione **"Deploy from GitHub repo"**
5. Escolha seu repositório `stockmaster`

### Passo 3: Configurar o Backend

1. **Railway vai detectar automaticamente**, mas vamos configurar:

2. **Clique no serviço do backend** → **Settings**:
   - **Root Directory:** `backend`
   - **Build Command:** (deixe vazio, o nixpacks.toml já configura)
   - **Start Command:** `npm start`

3. **Adicione as Variáveis de Ambiente** (Settings → Variables):

   ```
   DATABASE_URL=postgresql://postgres:Advida0909ds@db.rbzbltzjgtpmkmtmefuf.supabase.co:5432/postgres?sslmode=require
   DIRECT_URL=postgresql://postgres:Advida0909ds@db.rbzbltzjgtpmkmtmefuf.supabase.co:5432/postgres?sslmode=require
   PORT=3333
   NODE_ENV=production
   JWT_SECRET=sua-chave-super-secreta-e-longa-aqui-mude-isso-123456789
   ```

   ⚠️ **IMPORTANTE:** 
   - Substitua `sua-chave-super-secreta-e-longa-aqui-mude-isso-123456789` por uma chave secreta forte e única
   - Use a mesma chave em todos os ambientes (produção, desenvolvimento)

4. **Aguarde o deploy:**
   - Railway vai instalar dependências
   - Gerar o Prisma Client
   - Fazer build do projeto
   - Executar `prisma db push` para criar as tabelas
   - Iniciar o servidor

5. **Pegue a URL do backend:**
   - No serviço, clique em **Settings** → **Generate Domain**
   - Copie a URL (ex: `https://stockmaster-backend.railway.app`)

### Passo 4: Configurar o Frontend

1. **Adicione um novo serviço:**
   - No projeto Railway, clique em **"New"** → **"GitHub Repo"**
   - Selecione o mesmo repositório `stockmaster`

2. **Configure o serviço** (Settings):
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npx serve -s dist -l 3000`

3. **Adicione Variável de Ambiente:**
   ```
   VITE_API_URL=https://stockmaster-backend.railway.app
   ```
   ⚠️ **Substitua** pela URL real do seu backend do Passo 3

4. **Gere o domínio:**
   - Settings → **Generate Domain**
   - Copie a URL do frontend

### Passo 5: Testar o Deploy

1. **Teste o backend:**
   ```bash
   curl https://seu-backend.railway.app
   ```
   Deve retornar: `{"message":"API Funcionando"}`

2. **Teste criar usuário:**
   ```bash
   curl -X POST https://seu-backend.railway.app/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Admin","email":"admin@test.com","password":"123456","role":"ADMIN"}'
   ```

3. **Acesse o frontend:**
   - Abra a URL do frontend no navegador
   - Faça login com o usuário criado

---

## 🎯 Opção 2: Usar PostgreSQL do Railway

Se preferir usar o banco do Railway ao invés do Supabase:

### Passo 1-2: Igual à Opção 1

### Passo 3: Criar Banco PostgreSQL no Railway

1. No projeto Railway, clique em **"New"** → **"Database"** → **"PostgreSQL"**
2. Railway vai criar automaticamente
3. **Copie a `DATABASE_URL`** que aparece (ela já está configurada automaticamente)

### Passo 4: Configurar Backend

1. **Adicione Variáveis de Ambiente:**
   ```
   DATABASE_URL=<a-url-que-railway-gerou-automaticamente>
   DIRECT_URL=<a-url-que-railway-gerou-automaticamente>
   PORT=3333
   NODE_ENV=production
   JWT_SECRET=sua-chave-super-secreta-e-longa-aqui-mude-isso-123456789
   ```

   ⚠️ **Nota:** Railway já adiciona a `DATABASE_URL` automaticamente, mas você precisa adicionar o `DIRECT_URL` manualmente (pode ser a mesma URL).

2. **O resto é igual à Opção 1**

---

## 🔧 Configurações Avançadas

### Usar Connection Pooling do Supabase (Recomendado para Produção)

Para melhor performance, use a URL de connection pooling do Supabase:

1. No Supabase, vá em **Settings** → **Database**
2. Copie a string de **"Connection pooling"** (porta 6543)
3. Use essa URL como `DATABASE_URL` no Railway
4. Use a URL direta (porta 5432) como `DIRECT_URL`

```
DATABASE_URL=postgresql://postgres.xxxxx:[PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres:Advida0909ds@db.rbzbltzjgtpmkmtmefuf.supabase.co:5432/postgres?sslmode=require
```

### Adicionar Domínio Customizado

1. No serviço, vá em **Settings** → **Networking**
2. Clique em **"Custom Domain"**
3. Adicione seu domínio
4. Configure o DNS conforme as instruções

---

## 🐛 Troubleshooting

### Backend não conecta no banco

- ✅ Verifique se a `DATABASE_URL` está correta
- ✅ Verifique se o `DIRECT_URL` está configurado
- ✅ Se usar Supabase, verifique se o IP do Railway está na whitelist (ou permita todos os IPs)
- ✅ Verifique os logs do Railway (clique no serviço → "Deployments" → "View Logs")

### Erro "Can't reach database server"

- ✅ Se usar Supabase, verifique se adicionou `?sslmode=require` na URL
- ✅ Verifique se a senha está correta
- ✅ Verifique se o banco está ativo no Supabase

### Frontend não conecta no backend

- ✅ Verifique se o `VITE_API_URL` está correto (com `https://`)
- ✅ Verifique se o backend está rodando (veja os logs)
- ✅ Verifique CORS no backend (deve estar configurado para aceitar requisições)

### Erro de build

- ✅ Verifique os logs do Railway
- ✅ Verifique se todas as dependências estão no `package.json`
- ✅ Verifique se o Node.js está na versão correta (20)

### Tabelas não foram criadas

- ✅ Verifique os logs do build (deve mostrar `prisma db push`)
- ✅ Execute manualmente: No Railway, vá em "Deployments" → "Redeploy"
- ✅ Ou conecte via terminal e execute: `npx prisma db push`

---

## 📝 Checklist Final

- [ ] Código está no GitHub
- [ ] Projeto criado no Railway
- [ ] Backend configurado com variáveis de ambiente
- [ ] Banco de dados configurado (Supabase ou Railway)
- [ ] Frontend configurado com `VITE_API_URL`
- [ ] Domínios gerados para backend e frontend
- [ ] Testado criação de usuário
- [ ] Testado login no frontend
- [ ] Tudo funcionando! 🎉

---

## 🎉 Pronto!

Seu StockMaster está no ar! 🚀

- **Backend:** `https://seu-backend.railway.app`
- **Frontend:** `https://seu-frontend.railway.app`

Qualquer problema, verifique os logs no Railway ou consulte a seção de Troubleshooting acima.
