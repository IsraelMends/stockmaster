# 📦 StockMaster

Sistema de Controle de Estoque completo, desenvolvido com Node.js, Express, TypeScript e PostgreSQL.

![Node.js](https://img.shields.io/badge/Node.js-v20+-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-blue)
![Prisma](https://img.shields.io/badge/Prisma-7.0+-purple)

---

## 📋 Sobre o Projeto

O **StockMaster** é um sistema completo de controle de estoque que permite:

- ✅ Gerenciar produtos, categorias e fornecedores
- ✅ Controlar entrada e saída de estoque
- ✅ Alertas de estoque mínimo
- ✅ Histórico de movimentações
- ✅ Múltiplos usuários com permissões (Admin/Operador)
- ✅ Relatórios e dashboards

---

## 🚀 Tecnologias Utilizadas

### Backend
| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| Node.js | 20+ | Runtime JavaScript |
| Express | 5.x | Framework web |
| TypeScript | 5.x | Superset JavaScript com tipagem |
| Prisma | 7.x | ORM para banco de dados |
| PostgreSQL | 16+ | Banco de dados relacional |
| JWT | - | Autenticação e autorização |
| Zod | 4.x | Validação de dados |
| bcryptjs | - | Criptografia de senhas |

### Frontend (Em breve)
| Tecnologia | Descrição |
|------------|-----------|
| React | Biblioteca UI |
| TailwindCSS | Estilização |
| React Query | Gerenciamento de estado |

---

## 📁 Estrutura do Projeto

```
stockmaster/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Controladores (lógica das rotas)
│   │   │   ├── alertController.ts
│   │   │   ├── authController.ts
│   │   │   ├── categoryController.ts
│   │   │   ├── dashboardController.ts
│   │   │   ├── productController.ts
│   │   │   ├── stockMovementController.ts
│   │   │   ├── supplierControll.ts
│   │   │   └── userController.ts
│   │   ├── routes/           # Definição das rotas
│   │   │   ├── alertRoutes.ts
│   │   │   ├── authRoutes.ts
│   │   │   ├── categoriesRoutes.ts
│   │   │   ├── dashboardRoutes.ts
│   │   │   ├── productRoutes.ts
│   │   │   ├── stockMovementsRoutes.ts
│   │   │   ├── suppliersRoutes.ts
│   │   │   └── userRoutes.ts
│   │   ├── validations/      # Validações com Zod
│   │   │   ├── categoryValidation.ts
│   │   │   ├── productsValidation.ts
│   │   │   ├── stockMovementValidation.ts
│   │   │   ├── suppliersValidation.ts
│   │   │   └── userValidation.ts
│   │   ├── lib/              # Configurações
│   │   │   └── prisma.ts     # Cliente Prisma
│   │   ├── middlewares/      # Middlewares (auth, validação)
│   │   ├── services/         # Lógica de negócio
│   │   ├── utils/            # Funções utilitárias
│   │   └── server.ts         # Entrada da aplicação
│   ├── prisma/
│   │   └── schema.prisma     # Modelo do banco de dados
│   ├── package.json
│   └── tsconfig.json
├── frontend/                 # (Em breve)
└── README.md
```

---

## 🗄️ Modelo do Banco de Dados

### Entidades

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Category   │     │   Product   │     │  Supplier   │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ id          │◄────│ categoryId  │     │ id          │
│ name        │     │ supplierId  │────►│ name        │
│ description │     │ name        │     │ cnpj        │
│ createdAt   │     │ barcode     │     │ email       │
└─────────────┘     │ costPrice   │     │ phone       │
                    │ salePrice   │     │ address     │
┌─────────────┐     │ currentStock│     └─────────────┘
│    User     │     │ minimumStock│
├─────────────┤     │ unit        │     ┌─────────────┐
│ id          │     │ active      │     │   Alert     │
│ name        │     └─────────────┘     ├─────────────┤
│ email       │                         │ id          │
│ password    │     ┌─────────────┐     │ productId   │
│ role        │     │StockMoviment│     │ type        │
│ active      │     ├─────────────┤     │ message     │
└─────────────┘     │ id          │     │ read        │
       │            │ productId   │     └─────────────┘
       │            │ userId      │────►
       └───────────►│ type        │
                    │ quantity    │
                    │ reason      │
                    └─────────────┘
```

### Enums

| Enum | Valores |
|------|---------|
| Role | `ADMIN`, `OPERATOR` |
| Unit | `UN`, `KG`, `LT`, `PCT`, `CX` |
| MovimentType | `ENTRY`, `EXIT`, `ADJUSTMENT` |
| MovimentReason | `PURCHASE`, `SALE`, `LOSS`, `RETURN`, `ADJUSTMENT` |
| AlertType | `LOW_STOCK`, `EXPIRING` |

---

## 🛠️ Instalação

### Pré-requisitos

- Node.js 20+
- PostgreSQL 16+
- npm ou yarn

### Passo a passo

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/stockmaster.git
cd stockmaster
```

2. **Instale as dependências do backend**
```bash
cd backend
npm install
```

3. **Configure as variáveis de ambiente**
```bash
# Crie o arquivo .env na pasta backend
cp .env.example .env

# Edite com suas configurações
```

Conteúdo do `.env`:
```env
PORT=3333
NODE_ENV=development
DATABASE_URL="postgresql://seu_usuario@localhost:5432/stockmaster"
JWT_SECRET="sua-chave-secreta"
JWT_EXPIRES_IN="7d"
```

4. **Inicie o PostgreSQL e crie o banco**
```bash
createdb stockmaster
```

5. **Execute as migrations do Prisma**
```bash
npx prisma db push
npx prisma generate
```

6. **Inicie o servidor**
```bash
npm run dev
```

O servidor estará rodando em `http://localhost:3333`

---

## 📡 Endpoints da API

### Base URL
```
http://localhost:3333
```

### Categorias

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/categories` | Lista todas as categorias (com filtros) |
| GET | `/categories/:id` | Busca categoria por ID |
| POST | `/categories` | Cria nova categoria |
| PUT | `/categories/:id` | Atualiza categoria |
| DELETE | `/categories/:id` | Remove categoria |

**Exemplo de body (POST/PUT):**
```json
{
  "name": "Bebidas",
  "description": "Refrigerantes, sucos e águas"
}
```

**Query params (GET /categories):**
- `search` - Buscar por nome
- `page` - Número da página
- `limit` - Itens por página

### Produtos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/products` | Lista todos os produtos (com filtros) |
| GET | `/products/:id` | Busca produto por ID |
| POST | `/products` | Cria novo produto |
| PUT | `/products/:id` | Atualiza produto |
| DELETE | `/products/:id` | Desativa produto (soft delete) |

**Exemplo de body (POST/PUT):**
```json
{
  "name": "Coca-Cola 2L",
  "barcode": "7891234567890",
  "description": "Refrigerante Coca-Cola 2 litros",
  "costPrice": 5.50,
  "salePrice": 8.99,
  "currentStock": 100,
  "minimumStock": 20,
  "unit": "UN",
  "categoryId": 1,
  "supplierId": 1
}
```

**Query params (GET /products):**
- `categoryId` - Filtrar por categoria
- `supplierId` - Filtrar por fornecedor
- `active` - Filtrar por ativo/inativo (true/false)
- `search` - Buscar por nome ou código de barras
- `page` - Número da página
- `limit` - Itens por página

### Fornecedores

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/suppliers` | Lista todos os fornecedores (com filtros) |
| GET | `/suppliers/:id` | Busca fornecedor por ID |
| POST | `/suppliers` | Cria novo fornecedor |
| PUT | `/suppliers/:id` | Atualiza fornecedor |
| DELETE | `/suppliers/:id` | Remove fornecedor |

**Exemplo de body (POST/PUT):**
```json
{
  "name": "Distribuidora ABC",
  "cnpj": "12345678000199",
  "email": "contato@distribuidora.com",
  "phone": "11999999999",
  "address": "Rua das Flores, 123"
}
```

**Query params (GET /suppliers):**
- `search` - Buscar por nome, CNPJ ou email
- `page` - Número da página
- `limit` - Itens por página

### Autenticação

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/auth/register` | Registra novo usuário |
| POST | `/auth/login` | Faz login e retorna token JWT |

**Exemplo de body (POST /auth/register):**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "senha123",
  "role": "ADMIN"
}
```

**Exemplo de body (POST /auth/login):**
```json
{
  "email": "joao@email.com",
  "password": "senha123"
}
```

**Nota:** Todas as rotas abaixo (exceto autenticação) requerem o header `Authorization: Bearer <token>`

### Usuários

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/users` | Lista todos os usuários | Autenticado |
| GET | `/users/:id` | Busca usuário por ID | Autenticado |
| PUT | `/users/:id` | Atualiza usuário | Admin |
| DELETE | `/users/:id` | Desativa usuário (soft delete) | Admin |

**Query params (GET /users):**
- `search` - Buscar por nome ou email
- `page` - Número da página
- `limit` - Itens por página

**Exemplo de body (PUT /users/:id):**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "novaSenha123",
  "role": "ADMIN",
  "active": true
}
```

### Movimentações de Estoque

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/stock-movements` | Lista movimentações (paginado, com filtros) |
| GET | `/stock-movements/:id` | Busca movimentação por ID |
| POST | `/stock-movements` | Cria nova movimentação |

**Exemplo de body (POST /stock-movements):**
```json
{
  "productId": 1,
  "type": "ENTRY",
  "reason": "PURCHASE",
  "quantity": 50,
  "notes": "Compra de fornecedor"
}
```

**Tipos de movimentação:**
- `ENTRY` - Entrada de estoque
- `EXIT` - Saída de estoque
- `ADJUSTMENT` - Ajuste de estoque

**Motivos:**
- `PURCHASE` - Compra
- `SALE` - Venda
- `LOSS` - Perda
- `RETURN` - Devolução
- `ADJUSTMENT` - Ajuste

**Query params (GET /stock-movements):**
- `productId` - Filtrar por produto
- `userId` - Filtrar por usuário
- `type` - Filtrar por tipo (ENTRY, EXIT, ADJUSTMENT)
- `reason` - Filtrar por motivo (PURCHASE, SALE, LOSS, RETURN, ADJUSTMENT)
- `startDate` - Data inicial (formato: YYYY-MM-DD)
- `endDate` - Data final (formato: YYYY-MM-DD)
- `page` - Número da página
- `limit` - Itens por página

**Exemplos de uso:**
```bash
# Movimentações de hoje
GET /stock-movements?startDate=2024-01-15&endDate=2024-01-15

# Movimentações deste mês
GET /stock-movements?startDate=2024-01-01&endDate=2024-01-31

# Movimentações de um produto em um período
GET /stock-movements?productId=1&startDate=2024-01-01&endDate=2024-01-31

# Combinar filtros
GET /stock-movements?type=ENTRY&startDate=2024-01-01&endDate=2024-01-31
```

### Alertas

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/alerts` | Lista alertas (paginado, com filtros) |
| GET | `/alerts/:id` | Busca alerta por ID |
| GET | `/alerts/unread/count` | Conta alertas não lidos |
| PATCH | `/alerts/:id/read` | Marca alerta como lido |
| PATCH | `/alerts/read-all` | Marca todos os alertas como lidos |
| DELETE | `/alerts/:id` | Remove alerta |

**Query params (GET /alerts):**
- `read` - Filtrar por lidos/não lidos (true/false)
- `type` - Filtrar por tipo (LOW_STOCK, EXPIRING)
- `page` - Número da página
- `limit` - Itens por página

### Dashboard

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/dashboard` | Retorna estatísticas gerais |

**Resposta:**
```json
{
  "totalCategories": 10,
  "totalProducts": 150,
  "totalSuppliers": 5,
  "totalUnreadAlerts": 3,
  "lowStockCount": 8,
  "totalStockValue": 125000.50,
  "movementsByPeriod": {
    "today": 15,
    "thisWeek": 120,
    "thisMonth": 450
  },
  "movementsByType": {
    "entries": 200,
    "exits": 150,
    "adjustments": 10
  },
  "topProducts": [...],
  "valueByCategory": [...],
  "recentMovements": [...]
}
```

### Relatórios

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/reports/low-stock` | Relatório de produtos com estoque baixo |
| GET | `/reports/movements` | Relatório de movimentações por período |
| GET | `/reports/products-by-category` | Relatório de produtos agrupados por categoria |

**Query params (GET /reports/movements):**
- `startDate` - Data inicial (formato: YYYY-MM-DD)
- `endDate` - Data final (formato: YYYY-MM-DD)
- `type` - Filtrar por tipo (ENTRY, EXIT, ADJUSTMENT)
- `reason` - Filtrar por motivo (PURCHASE, SALE, LOSS, RETURN, ADJUSTMENT)

**Exemplo de uso:**
```bash
# Produtos com estoque baixo
GET /reports/low-stock

# Movimentações deste mês
GET /reports/movements?startDate=2024-01-01&endDate=2024-01-31

# Movimentações de entrada
GET /reports/movements?type=ENTRY&startDate=2024-01-01&endDate=2024-01-31

# Produtos por categoria
GET /reports/products-by-category
```

**Resposta (GET /reports/low-stock):**
```json
{
  "total": 5,
  "data": [
    {
      "productId": 1,
      "productName": "Coca-Cola 2L",
      "currentStock": 10,
      "minimumStock": 20,
      "unit": "UN",
      "difference": 10,
      "category": { "id": 1, "name": "Bebidas" },
      "supplier": { "id": 1, "name": "Distribuidora ABC" },
      "costPrice": 5.50,
      "salePrice": 8.99
    }
  ]
}
```

**Resposta (GET /reports/movements):**
```json
{
  "period": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  },
  "summary": {
    "totalMovements": 150,
    "byType": {
      "ENTRY": 100,
      "EXIT": 45,
      "ADJUSTMENT": 5
    },
    "byReason": {
      "PURCHASE": 80,
      "SALE": 40,
      "LOSS": 5
    },
    "netQuantity": 55
  },
  "data": [...]
}
```

---

## 🔒 Soft Delete

O sistema utiliza **Soft Delete** para produtos e usuários. Isso significa que ao "deletar" um registro, ele não é removido permanentemente do banco de dados, mas sim **desativado** (campo `active = false`).

### Benefícios:
- ✅ Mantém histórico de dados
- ✅ Permite recuperação de registros
- ✅ Evita perda de dados importantes
- ✅ Mantém integridade referencial

### Entidades com Soft Delete:
- **Produtos**: `DELETE /products/:id` → desativa o produto
- **Usuários**: `DELETE /users/:id` → desativa o usuário

### Para reativar:
Use o endpoint `PUT` para atualizar o campo `active` para `true`.

---

## 🧪 Testando a API

### Usando cURL

```bash
# Listar categorias
curl http://localhost:3333/categories

# Criar categoria
curl -X POST http://localhost:3333/categories \
  -H "Content-Type: application/json" \
  -d '{"name": "Bebidas", "description": "Refrigerantes e sucos"}'
```

### Usando Insomnia/Postman

Importe a collection ou configure manualmente os endpoints listados acima.

---

## 📜 Scripts Disponíveis

```bash
# Desenvolvimento (com hot-reload)
npm run dev

# Build para produção
npm run build

# Executar versão de produção
npm start

# Prisma - Gerar cliente
npm run db:generate

# Prisma - Sincronizar schema
npm run db:push

# Prisma - Interface visual do banco
npm run db:studio
```

---

## 🗺️ Roadmap

### Fase 1: Planejamento ✅
- [x] Definição de entidades
- [x] Modelagem do banco de dados
- [x] Definição de relacionamentos

### Fase 2: Fundação ✅
- [x] Setup Node.js + Express + TypeScript
- [x] Configuração do Prisma + PostgreSQL
- [x] Estrutura de pastas

### Fase 3: Funcionalidades Básicas ✅
- [x] CRUD de Categorias
- [x] CRUD de Produtos
- [x] CRUD de Fornecedores
- [x] CRUD de Usuários
- [x] Autenticação JWT
- [x] Movimentações de estoque

### Fase 4: Funcionalidades Avançadas ✅
- [x] Alertas de estoque baixo
- [x] Dashboard com estatísticas
- [x] Filtros avançados de busca
- [x] Filtros por data nas movimentações
- [x] Relatórios detalhados
- [ ] Exportar PDF/Excel

### Fase 5: Frontend ⏳
- [ ] Interface React
- [ ] Telas de CRUD
- [ ] Dashboard visual
- [ ] Gráficos

### Fase 6: Deploy ⏳
- [ ] Containerização (Docker)
- [ ] Deploy na nuvem
- [ ] CI/CD

---

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

---

## 📝 Convenção de Commits

Este projeto segue o padrão [Conventional Commits](https://www.conventionalcommits.org/):

| Prefixo | Descrição |
|---------|-----------|
| `feat:` | Nova funcionalidade |
| `fix:` | Correção de bug |
| `docs:` | Documentação |
| `style:` | Formatação |
| `refactor:` | Refatoração |
| `test:` | Testes |
| `chore:` | Configurações |

---

## 📄 Licença

Este projeto está sob a licença ISC.

---

## 👨‍💻 Autor

Desenvolvido como projeto de aprendizado.

---

## 🙏 Agradecimentos

- [Prisma](https://www.prisma.io/) - ORM incrível
- [Express](https://expressjs.com/) - Framework web
- [TypeScript](https://www.typescriptlang.org/) - Tipagem estática

---

<p align="center">
  Feito com 💜 e muito ☕
</p>
