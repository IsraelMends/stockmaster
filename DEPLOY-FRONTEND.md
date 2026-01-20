# 🚀 Deploy do Frontend - StockMaster

Este guia explica como fazer o deploy do frontend do StockMaster.

## 📋 Pré-requisitos

- Conta no Railway (ou outra plataforma de sua escolha)
- Backend já deployado e funcionando
- URL da API do backend

## 🔧 Configuração Local

### 1. Variáveis de Ambiente

Crie um arquivo `.env` na pasta `frontend/`:

```env
VITE_API_URL=https://seu-backend.railway.app
```

**Importante:** Substitua `https://seu-backend.railway.app` pela URL real do seu backend no Railway.

### 2. Testar Localmente

```bash
cd frontend
npm install
npm run dev
```

Acesse `http://localhost:5173` e verifique se está conectando com o backend.

## 🐳 Deploy com Docker (Local)

### Usando Docker Compose

```bash
# Na raiz do projeto
docker-compose up frontend
```

O frontend estará disponível em `http://localhost:80`

## ☁️ Deploy no Railway

### Opção 1: Usando Dockerfile (Recomendado)

1. **Criar novo serviço no Railway:**
   - No dashboard do Railway, clique em "New Project"
   - Selecione "Empty Project"
   - Clique em "Add Service" → "GitHub Repo"
   - Selecione seu repositório

2. **Configurar o serviço:**
   - **Root Directory:** `frontend`
   - **Build Command:** (deixe vazio, o Dockerfile cuida disso)
   - **Start Command:** (deixe vazio, o Dockerfile cuida disso)

3. **Configurar variáveis de ambiente:**
   - Vá em "Variables"
   - Adicione:
     ```
     VITE_API_URL=https://seu-backend.railway.app
     ```
   - Substitua pela URL real do seu backend

4. **Configurar o Dockerfile:**
   - O Railway detectará automaticamente o Dockerfile na pasta `frontend/`
   - O build será feito automaticamente

5. **Deploy:**
   - O Railway fará o deploy automaticamente após o push
   - Ou clique em "Deploy" manualmente

### Opção 2: Usando Nixpacks (Alternativa)

Se preferir não usar Docker:

1. **Criar `nixpacks.toml` na pasta `frontend/`:**

```toml
[phases.setup]
nixPkgs = ["nodejs_20"]

[phases.install]
cmds = [
  "npm install"
]

[phases.build]
cmds = [
  "npm run build"
]

[start]
cmd = "npx serve -s dist -l 3000"
```

2. **Configurar variáveis de ambiente:**
   ```
   VITE_API_URL=https://seu-backend.railway.app
   PORT=3000
   ```

3. **Configurar o serviço:**
   - **Root Directory:** `frontend`
   - **Build Command:** (deixe vazio, o Nixpacks cuida)
   - **Start Command:** (deixe vazio, o Nixpacks cuida)

## 🔍 Verificações Pós-Deploy

1. **Acesse a URL do frontend**
2. **Teste o login:**
   - Use as credenciais do seu usuário admin
   - Verifique se consegue fazer login

3. **Teste funcionalidades:**
   - Dashboard carrega?
   - Produtos listam?
   - Criação/edição funciona?

## 🐛 Troubleshooting

### Erro: "Cannot connect to API"

**Problema:** O frontend não consegue conectar ao backend.

**Solução:**
1. Verifique se `VITE_API_URL` está configurada corretamente
2. Verifique se o backend está rodando
3. Verifique CORS no backend (deve permitir a origem do frontend)

### Erro: "404 Not Found" ao navegar

**Problema:** O React Router não está funcionando.

**Solução:**
- Verifique se o `nginx.conf` está configurado corretamente
- Deve ter `try_files $uri $uri/ /index.html;`

### Build falha

**Problema:** Erro durante o build.

**Solução:**
1. Verifique os logs do Railway
2. Certifique-se de que todas as dependências estão no `package.json`
3. Verifique se não há erros de TypeScript

## 📝 Notas Importantes

- **Variáveis de ambiente:** No Vite, variáveis devem começar com `VITE_` para serem expostas no build
- **CORS:** Certifique-se de que o backend permite requisições do domínio do frontend
- **HTTPS:** Em produção, sempre use HTTPS
- **Cache:** O Nginx pode cachear arquivos estáticos. Considere adicionar headers de cache

## 🔗 Links Úteis

- [Documentação do Railway](https://docs.railway.app/)
- [Documentação do Vite](https://vitejs.dev/)
- [Documentação do Nginx](https://nginx.org/en/docs/)
