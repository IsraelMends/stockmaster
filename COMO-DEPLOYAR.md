# 🚀 Como Colocar o Projeto na Nuvem

Guia simples e direto para fazer deploy do StockMaster.

---

## 🎯 Opção Mais Fácil: Railway

Railway é a opção mais simples para começar. É grátis e muito fácil de usar.

### 📋 Passo a Passo

#### 1. Preparar o Código no GitHub

```bash
# Se ainda não tem git inicializado
git init
git add .
git commit -m "Projeto StockMaster completo"

# Crie um repositório no GitHub e depois:
git remote add origin https://github.com/SEU-USUARIO/stockmaster.git
git push -u origin main
```

#### 2. Criar Conta no Railway

1. Acesse: **https://railway.app**
2. Clique em "Login" e faça login com **GitHub**
3. Clique em "New Project"

#### 3. Deploy do Backend

1. **Clique em "New" → "GitHub Repo"**
   - Selecione seu repositório `stockmaster`
   - Railway vai detectar automaticamente

2. **Configure o serviço:**
   - Clique em "Settings"
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npx prisma generate && npm run build`
   - **Start Command:** `npm start`

3. **Adicione o Banco PostgreSQL:**
   - Clique em "New" → "Database" → "PostgreSQL"
   - Railway cria automaticamente
   - **Copie a `DATABASE_URL`** que aparece

4. **Adicione Variáveis de Ambiente:**
   - Clique em "Variables"
   - Adicione:
     ```
     DATABASE_URL=<cole-a-url-que-railway-gerou>
     PORT=3333
     NODE_ENV=production
     JWT_SECRET=uma-chave-super-secreta-e-longa-123456789
     JWT_EXPIRES_IN=7d
     ```

5. **Aguarde o deploy terminar**
   - Railway vai fazer tudo automaticamente
   - Quando terminar, você verá uma URL pública (ex: `https://stockmaster-backend.railway.app`)

#### 4. Deploy do Frontend

1. **Adicione outro serviço:**
   - Clique em "New" → "GitHub Repo" (mesmo repositório)
   - Clique em "Settings"
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npx serve -s dist -l 3000`

2. **Adicione Variável de Ambiente:**
   - Clique em "Variables"
   - Adicione:
     ```
     VITE_API_URL=https://SEU-BACKEND.railway.app
     ```
   (Substitua `SEU-BACKEND` pela URL real do seu backend)

3. **Configure Domínio:**
   - Clique em "Settings" → "Generate Domain"
   - Railway vai gerar uma URL pública para o frontend

#### 5. Pronto!

- **Frontend:** `https://seu-frontend.railway.app`
- **Backend:** `https://seu-backend.railway.app`

Acesse a URL do frontend no navegador e teste!

---

## 🔄 Atualizar o Projeto

Sempre que você fizer mudanças:

1. **Commit e push no GitHub:**
```bash
git add .
git commit -m "Sua mensagem"
git push
```

2. **Railway detecta automaticamente e faz novo deploy!**

---

## 💰 Custos

- **Railway:** Grátis até $5/mês de uso
- **Render:** Grátis mas pode "dormir" após inatividade
- **Vercel:** Grátis para projetos pessoais

---

## ⚠️ Importante

1. **Nunca commite arquivos `.env`** (já está no .gitignore)
2. **Use variáveis de ambiente** na plataforma
3. **JWT_SECRET deve ser forte** (mínimo 32 caracteres)
4. **Teste sempre após deploy**

---

## 🆘 Problemas?

### Backend não conecta no banco
- Verifique se a `DATABASE_URL` está correta
- Use a URL **interna** que Railway fornece

### Frontend não conecta no backend
- Verifique o `VITE_API_URL`
- Use a URL **pública** do backend (com https://)

### Erro de build
- Veja os logs na plataforma
- Verifique se todas as dependências estão no `package.json`

---

## 📚 Documentação Completa

Veja o arquivo `DEPLOY.md` para mais detalhes e outras opções de deploy.
