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
| JWT | - | Autenticação (em desenvolvimento) |
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
│   │   │   ├── categoryController.ts
│   │   │   ├── productController.ts
│   │   │   └── supplierControll.ts
│   │   ├── routes/           # Definição das rotas
│   │   │   ├── categoriesRoutes.ts
│   │   │   ├── productRoutes.ts
│   │   │   └── suppliersRoutes.ts
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
| GET | `/categories` | Lista todas as categorias |
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

### Produtos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/products` | Lista todos os produtos |
| GET | `/products/:id` | Busca produto por ID |
| POST | `/products` | Cria novo produto |
| PUT | `/products/:id` | Atualiza produto |
| DELETE | `/products/:id` | Remove produto |

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

### Fornecedores

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/suppliers` | Lista todos os fornecedores |
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

### Fase 3: Funcionalidades Básicas 🔄
- [x] CRUD de Categorias
- [x] CRUD de Produtos
- [x] CRUD de Fornecedores
- [ ] CRUD de Usuários
- [ ] Autenticação JWT
- [ ] Movimentações de estoque

### Fase 4: Funcionalidades Avançadas ⏳
- [ ] Alertas de estoque baixo
- [ ] Relatórios
- [ ] Dashboard
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
