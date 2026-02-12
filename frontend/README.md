# StockMaster Frontend (Next.js)

Frontend profissional do StockMaster construído com Next.js 16, React 19, TypeScript e TailwindCSS v4.

## 🚀 Tecnologias

- **Next.js 16** - Framework React com App Router
- **React 19** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **TailwindCSS v4** - Estilização moderna
- **Framer Motion** - Animações avançadas
- **React Query** - Gerenciamento de estado e cache
- **Axios** - Cliente HTTP
- **Lucide React** - Ícones modernos
- **Recharts** - Gráficos e visualizações
- **React Hot Toast** - Notificações elegantes

## 📦 Instalação

```bash
npm install
```

## 🔧 Configuração

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_API_URL=http://localhost:3333
```

## 🏃 Executando

### Desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

### Build de Produção

```bash
npm run build
npm start
```

## 📁 Estrutura do Projeto

```
src/
├── app/                    # App Router do Next.js
│   ├── layout.tsx         # Layout raiz
│   ├── page.tsx           # Página inicial (redirect)
│   ├── login/             # Página de login
│   └── globals.css        # Estilos globais
├── components/            # Componentes React
│   ├── ui/                # Componentes UI base
│   └── providers/         # Providers (QueryClient, etc)
└── lib/                   # Utilitários
    ├── api.ts             # Cliente Axios configurado
    └── utils.ts           # Funções utilitárias
```

## 🎨 Sistema de Design

O projeto utiliza um sistema de design profissional com:

- **CSS Variables** para temas light/dark
- **Grid patterns** para backgrounds
- **Gradientes animados** para textos
- **Cards elevados** com sombras dinâmicas
- **Animações suaves** com Framer Motion

## 🔐 Autenticação

O sistema utiliza JWT tokens armazenados no `localStorage`. O cliente Axios está configurado para:

- Adicionar automaticamente o token nas requisições
- Redirecionar para `/login` em caso de 401
- Limpar dados de autenticação em caso de erro

## 📝 Próximos Passos

- [ ] Criar páginas protegidas (Dashboard, Products, etc)
- [ ] Implementar Layout com sidebar
- [ ] Adicionar todas as funcionalidades CRUD
- [ ] Implementar relatórios e gráficos
- [ ] Adicionar testes
