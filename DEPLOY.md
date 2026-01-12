# 🚀 Guia de Deploy - StockMaster

Este guia explica como colocar seu projeto na nuvem para ficar acessível publicamente.

---

## 🎯 Opções de Deploy

### Opção 0: Usar Supabase como Banco de Dados 🗄️ (Recomendado)
- ✅ Banco PostgreSQL gratuito e robusto
- ✅ Interface web para gerenciar dados
- ✅ Funciona com qualquer plataforma de deploy
- ✅ 500 MB grátis (suficiente para começar)
- ✅ Veja o guia completo: [CONFIGURAR-SUPABASE.md](./CONFIGURAR-SUPABASE.md)

### Opção 1: Railway (Recomendado - Mais Fácil) ⭐
- ✅ Grátis para começar
- ✅ Muito fácil de usar
- ✅ Deploy automático do GitHub
- ✅ Banco PostgreSQL incluído (ou use Supabase)
- ✅ Suporta Docker

### Opção 2: Render
- ✅ Grátis para começar
- ✅ Fácil de usar
- ✅ Banco PostgreSQL incluído (ou use Supabase)
- ⚠️ Pode "dormir" após inatividade (plano gratuito)

### Opção 3: Vercel (Frontend) + Railway/Render (Backend)
- ✅ Vercel excelente para frontend
- ✅ Deploy muito rápido
- ⚠️ Precisa configurar 2 serviços

---

## 🗄️ Configurar Supabase (Recomendado)

**Antes de fazer o deploy, configure o Supabase como banco de dados:**

1. **Siga o guia completo:** [CONFIGURAR-SUPABASE.md](./CONFIGURAR-SUPABASE.md)

2. **Resumo rápido:**
   - Crie projeto no Supabase: https://supabase.com
   - Copie a `DATABASE_URL` (Connection pooling para produção)
   - Configure no `.env` local e nas variáveis de ambiente da plataforma
   - Execute `npm run db:push` para criar as tabelas

3. **Vantagens do Supabase:**
   - Banco separado do deploy (mais flexível)
   - Interface web para ver/editar dados
   - Funciona com qualquer plataforma
   - Plano gratuito generoso

---

## 🚂 Deploy no Railway (Recomendado)

### Passo 1: Preparar o Projeto

1. **Certifique-se que seu código está no GitHub:**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/seu-usuario/stockmaster.git
git push -u origin main
```

### Passo 2: Criar Conta no Railway

1. Acesse: https://railway.app
2. Faça login com GitHub
3. Clique em "New Project"

### Passo 3: Deploy do Backend

1. **Adicione um novo serviço:**
   - Clique em "New" → "GitHub Repo"
   - Selecione seu repositório
   - Railway vai detectar automaticamente

2. **Configure o serviço:**
   - Nome: `stockmaster-backend`
   - Root Directory: `backend`
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npm start`

3. **Adicione variáveis de ambiente:**
   - Clique em "Variables"
   - Adicione:
     ```
     PORT=3333
     NODE_ENV=production
     JWT_SECRET=sua-chave-super-secreta-aqui
     JWT_EXPIRES_IN=7d
     ```

4. **Configure o banco de dados:**
   
   **Opção A: Usar Supabase (Recomendado) 🗄️**
   - Configure o Supabase primeiro: [CONFIGURAR-SUPABASE.md](./CONFIGURAR-SUPABASE.md)
   - No Supabase, vá em "Settings" → "Database"
   - Copie a string de "Connection pooling" (porta 6543)
   - Adicione como variável de ambiente no Railway:
     ```
     DATABASE_URL=postgresql://postgres.xxxxx:[PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
     ```
   
   **Opção B: Usar PostgreSQL do Railway**
   - Clique em "New" → "Database" → "PostgreSQL"
   - Railway vai criar automaticamente
   - Copie a `DATABASE_URL` que aparece
   - Adicione como variável de ambiente no backend:
     ```
     DATABASE_URL=<a-url-que-railway-gerou>
     ```

5. **Configure o Prisma:**
   - Adicione no Build Command: `npm install && npx prisma generate && npx prisma db push && npm run build`
   - Ou execute manualmente após o deploy: `npx prisma db push`

### Passo 4: Deploy do Frontend

1. **Adicione outro serviço:**
   - Clique em "New" → "GitHub Repo" (mesmo repositório)
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npx serve -s dist -l 3000`

2. **Adicione variável de ambiente:**
   ```
   VITE_API_URL=https://seu-backend.railway.app
   ```
   (Substitua pela URL do seu backend no Railway)

3. **Configure domínio:**
   - Clique em "Settings" → "Generate Domain"
   - Railway vai gerar uma URL pública

### Passo 5: Atualizar Frontend com URL do Backend

1. **Pegue a URL do backend:**
   - No serviço do backend, clique em "Settings"
   - Copie a URL pública (ex: `https://stockmaster-backend.railway.app`)

2. **Atualize a variável no frontend:**
   - No serviço do frontend, atualize:
     ```
     VITE_API_URL=https://stockmaster-backend.railway.app
     ```
   - Faça um novo deploy

---

## 🎨 Deploy no Render

### Passo 1: Criar Conta

1. Acesse: https://render.com
2. Faça login com GitHub

### Passo 2: Deploy do Backend

1. **New → Web Service**
2. **Conecte seu repositório GitHub**
3. **Configure:**
   - Name: `stockmaster-backend`
   - Root Directory: `backend`
   - Environment: `Node`
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npm start`

4. **Adicione variáveis de ambiente:**
   ```
   PORT=3333
   NODE_ENV=production
   JWT_SECRET=sua-chave-secreta
   JWT_EXPIRES_IN=7d
   ```

5. **Configure o banco de dados:**
   
   **Opção A: Usar Supabase (Recomendado) 🗄️**
   - Configure o Supabase primeiro: [CONFIGURAR-SUPABASE.md](./CONFIGURAR-SUPABASE.md)
   - No Supabase, copie a string de "Connection pooling"
   - Adicione como variável no Render:
     ```
     DATABASE_URL=postgresql://postgres.xxxxx:[PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
     ```
   
   **Opção B: Usar PostgreSQL do Render**
   - New → PostgreSQL
   - Copie a `DATABASE_URL` interna
   - Adicione como variável no backend

### Passo 3: Deploy do Frontend

1. **New → Static Site**
2. **Conecte seu repositório**
3. **Configure:**
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

4. **Adicione variável de ambiente:**
   ```
   VITE_API_URL=https://seu-backend.onrender.com
   ```

---

## 🌐 Deploy no Vercel (Frontend) + Railway (Backend)

### Frontend no Vercel

1. Acesse: https://vercel.com
2. Faça login com GitHub
3. **Import Project:**
   - Selecione seu repositório
   - Root Directory: `frontend`
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Adicione variável:**
   ```
   VITE_API_URL=https://seu-backend.railway.app
   ```

5. **Deploy!**
   - Vercel vai gerar uma URL pública automaticamente

---

## 📝 Checklist Antes do Deploy

- [ ] Código está no GitHub
- [ ] `.env` não está commitado (deve estar no `.gitignore`)
- [ ] Dockerfiles estão corretos
- [ ] **Banco Supabase configurado** (veja [CONFIGURAR-SUPABASE.md](./CONFIGURAR-SUPABASE.md))
- [ ] Variáveis de ambiente configuradas (incluindo `DATABASE_URL` do Supabase)
- [ ] Prisma schema enviado ao banco (`npm run db:push`)
- [ ] Frontend aponta para URL do backend correto

---

## 🔒 Segurança no Deploy

### ⚠️ IMPORTANTE:

1. **Nunca commite arquivos `.env`**
2. **Use variáveis de ambiente** na plataforma
3. **JWT_SECRET deve ser forte e único**
4. **Use HTTPS** (plataformas fazem isso automaticamente)
5. **Configure CORS** se necessário

---

## 🧪 Testar Após Deploy

1. **Teste o backend:**
```bash
curl https://seu-backend.railway.app
```

2. **Teste criar usuário:**
```bash
curl -X POST https://seu-backend.railway.app/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@test.com","password":"123456","role":"ADMIN"}'
```

3. **Acesse o frontend:**
- Abra a URL pública no navegador
- Faça login
- Teste as funcionalidades

---

## 💡 Dicas

1. **Railway é mais fácil** para começar
2. **Render é grátis** mas pode "dormir"
3. **Vercel é excelente** para frontend
4. **Sempre teste** após deploy
5. **Monitore os logs** nas plataformas

---

## 🆘 Problemas Comuns

### Backend não conecta no banco
- **Se usar Supabase:** Verifique se usou Connection Pooling (porta 6543) em produção
- **Se usar banco da plataforma:** Verifique a `DATABASE_URL` (use a interna da plataforma)
- Verifique se o banco está rodando
- Verifique se executou `npx prisma db push` para criar as tabelas

### Frontend não conecta no backend
- Verifique o `VITE_API_URL`
- Verifique CORS no backend
- Verifique se o backend está público

### Erro de build
- Verifique os logs na plataforma
- Verifique se todas as dependências estão no `package.json`
- Verifique se o Node.js está na versão correta

---

## 🎉 Pronto!

Seu projeto estará acessível publicamente na URL que a plataforma gerar!
