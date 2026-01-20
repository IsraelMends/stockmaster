# 🚀 Sugestões de Melhorias para o StockMaster

Este documento contém sugestões de melhorias organizadas por categoria, com exemplos de código mostrando **como implementar** cada melhoria.

---

## 📋 Índice

1. [Backend - Arquitetura e Organização](#1-backend---arquitetura-e-organização)
2. [Backend - Segurança](#2-backend---segurança)
3. [Backend - Performance](#3-backend---performance)
4. [Backend - Tratamento de Erros](#4-backend---tratamento-de-erros)
5. [Backend - Validações](#5-backend---validações)
6. [Backend - Testes](#6-backend---testes)
7. [Frontend - Organização e Componentes](#7-frontend---organização-e-componentes)
8. [Frontend - UX/UI](#8-frontend---uxui)
9. [Geral - Configuração e DevOps](#9-geral---configuração-e-devops)

---

## 1. Backend - Arquitetura e Organização

### 1.1. Validação de Variáveis de Ambiente na Inicialização

**Problema:** Não há validação se as variáveis de ambiente obrigatórias estão definidas ao iniciar o servidor.

**Como melhorar:**

Crie um arquivo `backend/src/config/env.ts`:

```typescript
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().int().positive()),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET deve ter pelo menos 32 caracteres'),
  JWT_EXPIRES_IN: z.string().default('7d'),
})

export type Env = z.infer<typeof envSchema>

function validateEnv(): Env {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Erro na validação das variáveis de ambiente:')
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`)
      })
      process.exit(1)
    }
    throw error
  }
}

export const env = validateEnv()
```

E use no `server.ts`:

```typescript
import { env } from './config/env.js'

// Agora você tem tipagem e validação garantida
const PORT = env.PORT
const JWT_SECRET = env.JWT_SECRET
```

---

### 1.2. Centralizar Configurações

**Problema:** Configurações espalhadas pelo código (JWT_EXPIRES_IN hardcoded, etc).

**Como melhorar:**

Crie `backend/src/config/index.ts`:

```typescript
import { env } from './env.js'

export const config = {
  app: {
    port: env.PORT,
    nodeEnv: env.NODE_ENV,
  },
  database: {
    url: env.DATABASE_URL,
  },
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
  },
  cors: {
    origin: env.NODE_ENV === 'production' 
      ? ['https://seu-dominio.com'] 
      : ['http://localhost:5173'],
    credentials: true,
  },
} as const
```

Use no `server.ts`:

```typescript
import { config } from './config/index.js'

app.use(cors(config.cors))
```

---

### 1.3. Criar Tipos Compartilhados

**Problema:** Tipos duplicados entre controllers e falta de tipagem consistente.

**Como melhorar:**

Crie `backend/src/types/index.ts`:

```typescript
import { Role, Unit, MovimentType, MovimentReason, AlertType } from '@prisma/client'

// Tipos de Request customizados
export interface AuthenticatedRequest extends Request {
  userId: number
}

// Tipos de resposta padronizados
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Re-exportar enums do Prisma
export { Role, Unit, MovimentType, MovimentReason, AlertType }
```

Use nos controllers:

```typescript
import { AuthenticatedRequest, PaginatedResponse } from '../types/index.js'

const index = async (req: AuthenticatedRequest, res: Response<PaginatedResponse<Category>>) => {
  // ...
}
```

---

### 1.4. Separar Lógica de Negócio dos Controllers

**Problema:** Controllers fazem lógica de negócio diretamente (ex: `categoryController.ts`).

**Como melhorar:**

Crie `backend/src/services/categoryService.ts`:

```typescript
import { prisma } from '../lib/prisma.js'
import { Category, Prisma } from '@prisma/client'

export interface CreateCategoryData {
  name: string
  description?: string
}

export interface UpdateCategoryData {
  name?: string
  description?: string
}

export interface CategoryFilters {
  search?: string
  page?: number
  limit?: number
}

export class CategoryService {
  async findAll(filters: CategoryFilters) {
    const { search, page = 1, limit = 10 } = filters
    const skip = (page - 1) * limit
    
    const where: Prisma.CategoryWhereInput = {}
    
    if (search) {
      where.name = { contains: search, mode: 'insensitive' }
    }
    
    const [data, total] = await Promise.all([
      prisma.category.findMany({ skip, take: limit, where }),
      prisma.category.count({ where }),
    ])
    
    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }
  
  async findById(id: number) {
    return prisma.category.findUnique({ where: { id } })
  }
  
  async create(data: CreateCategoryData) {
    return prisma.category.create({ data })
  }
  
  async update(id: number, data: UpdateCategoryData) {
    return prisma.category.update({ where: { id }, data })
  }
  
  async delete(id: number) {
    return prisma.category.delete({ where: { id } })
  }
}

export const categoryService = new CategoryService()
```

E simplifique o controller:

```typescript
import { categoryService } from '../services/categoryService.js'

const index = async (req: Request, res: Response) => {
  const result = await categoryService.findAll({
    search: req.query.search as string,
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 10,
  })
  return res.json(result)
}
```

---

## 2. Backend - Segurança

### 2.1. Rate Limiting

**Problema:** Não há proteção contra ataques de força bruta ou abuso da API.

**Como melhorar:**

Instale: `npm install express-rate-limit`

Crie `backend/src/middlewares/rateLimitMiddleware.ts`:

```typescript
import rateLimit from 'express-rate-limit'

// Rate limit geral
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requisições por IP
  message: 'Muitas requisições deste IP, tente novamente em 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false,
})

// Rate limit para autenticação (mais restritivo)
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // apenas 5 tentativas de login por IP
  message: 'Muitas tentativas de login, tente novamente em 15 minutos.',
  skipSuccessfulRequests: true, // não conta requisições bem-sucedidas
})
```

Use no `server.ts`:

```typescript
import { generalRateLimit, authRateLimit } from './middlewares/rateLimitMiddleware.js'

app.use(generalRateLimit)

// Nas rotas de auth
router.post('/login', authRateLimit, login)
router.post('/register', authRateLimit, register)
```

---

### 2.2. Validação de Senha Forte

**Problema:** Não há validação de força da senha no registro.

**Como melhorar:**

Atualize `backend/src/validations/userValidation.ts`:

```typescript
import { z } from 'zod'

const passwordSchema = z
  .string()
  .min(8, 'A senha deve ter pelo menos 8 caracteres')
  .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
  .regex(/[a-z]/, 'A senha deve conter pelo menos uma letra minúscula')
  .regex(/[0-9]/, 'A senha deve conter pelo menos um número')
  .regex(/[^A-Za-z0-9]/, 'A senha deve conter pelo menos um caractere especial')

export const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: passwordSchema,
  role: z.enum(['ADMIN', 'OPERATOR']).optional(),
})

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
})
```

---

### 2.3. Sanitização de Inputs

**Problema:** Não há sanitização de dados de entrada para prevenir XSS.

**Como melhorar:**

Instale: `npm install dompurify` e `npm install --save-dev @types/dompurify`

Ou use uma biblioteca mais simples: `npm install validator`

Crie `backend/src/utils/sanitize.ts`:

```typescript
import validator from 'validator'

export function sanitizeString(input: string): string {
  return validator.escape(input.trim())
}

export function sanitizeEmail(email: string): string {
  return validator.normalizeEmail(email) || email
}

export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj }
  
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeString(sanitized[key])
    }
  }
  
  return sanitized
}
```

Use nos controllers:

```typescript
import { sanitizeString } from '../utils/sanitize.js'

const create = async (req: Request, res: Response) => {
  const { name, description } = req.body
  const category = await prisma.category.create({
    data: {
      name: sanitizeString(name),
      description: description ? sanitizeString(description) : undefined,
    },
  })
  return res.status(201).json(category)
}
```

---

### 2.4. Helmet para Headers de Segurança

**Problema:** Faltam headers de segurança HTTP.

**Como melhorar:**

Instale: `npm install helmet`

Use no `server.ts`:

```typescript
import helmet from 'helmet'

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
}))
```

---

## 3. Backend - Performance

### 3.1. Cache de Consultas Frequentes

**Problema:** Consultas repetidas ao banco sem cache (ex: categorias, fornecedores).

**Como melhorar:**

Instale: `npm install node-cache` ou `npm install ioredis` para Redis

Crie `backend/src/utils/cache.ts`:

```typescript
import NodeCache from 'node-cache'

const cache = new NodeCache({ stdTTL: 300 }) // 5 minutos

export function getCacheKey(prefix: string, ...keys: (string | number)[]): string {
  return `${prefix}:${keys.join(':')}`
}

export async function getOrSetCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  const cached = cache.get<T>(key)
  
  if (cached) {
    return cached
  }
  
  const data = await fetchFn()
  cache.set(key, data, ttl)
  
  return data
}

export function invalidateCache(pattern: string) {
  const keys = cache.keys().filter(key => key.startsWith(pattern))
  cache.del(keys)
}

export { cache }
```

Use no service:

```typescript
import { getOrSetCache, getCacheKey, invalidateCache } from '../utils/cache.js'

async findAll(filters: CategoryFilters) {
  const cacheKey = getCacheKey('categories', JSON.stringify(filters))
  
  return getOrSetCache(cacheKey, async () => {
    // ... lógica de busca
  }, 300) // cache por 5 minutos
}

async create(data: CreateCategoryData) {
  const category = await prisma.category.create({ data })
  invalidateCache('categories') // invalida cache ao criar
  return category
}
```

---

### 3.2. Paginação Otimizada com Cursor

**Problema:** Paginação offset pode ser lenta em grandes volumes de dados.

**Como melhorar:**

Para grandes volumes, use cursor-based pagination:

```typescript
export interface CursorPaginationParams {
  cursor?: number
  limit?: number
}

export interface CursorPaginatedResponse<T> {
  data: T[]
  nextCursor?: number
  hasMore: boolean
}

async findAllWithCursor(params: CursorPaginationParams): Promise<CursorPaginatedResponse<Category>> {
  const { cursor, limit = 10 } = params
  
  const where = cursor ? { id: { gt: cursor } } : {}
  
  const data = await prisma.category.findMany({
    take: limit + 1, // pega um a mais para saber se tem próxima página
    where,
    orderBy: { id: 'asc' },
  })
  
  const hasMore = data.length > limit
  const items = hasMore ? data.slice(0, -1) : data
  const nextCursor = hasMore ? items[items.length - 1].id : undefined
  
  return {
    data: items,
    nextCursor,
    hasMore,
  }
}
```

---

### 3.3. Índices no Banco de Dados

**Problema:** Consultas podem ser lentas sem índices adequados.

**Como melhorar:**

Atualize `backend/prisma/schema.prisma`:

```prisma
model Product {
  // ... campos existentes
  
  @@index([name]) // índice para busca por nome
  @@index([barcode]) // índice para busca por código de barras
  @@index([categoryId]) // índice para filtro por categoria
  @@index([supplierId]) // índice para filtro por fornecedor
  @@index([active]) // índice para filtro por status
}

model StockMoviment {
  // ... campos existentes
  
  @@index([productId])
  @@index([userId])
  @@index([type])
  @@index([createdAt]) // importante para filtros por data
  @@index([productId, createdAt]) // índice composto
}
```

Execute: `npx prisma db push`

---

## 4. Backend - Tratamento de Erros

### 4.1. Classes de Erro Customizadas

**Problema:** Erros genéricos sem contexto suficiente.

**Como melhorar:**

Crie `backend/src/errors/AppError.ts`:

```typescript
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string | number) {
    super(
      `${resource}${id ? ` com ID ${id}` : ''} não encontrado(a)`,
      404
    )
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public issues?: any[]) {
    super(message, 400)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Não autorizado') {
    super(message, 401)
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Acesso negado') {
    super(message, 403)
  }
}
```

Use nos controllers:

```typescript
import { NotFoundError } from '../errors/AppError.js'

const show = async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  const category = await prisma.category.findUnique({ where: { id } })
  
  if (!category) {
    throw new NotFoundError('Categoria', id)
  }
  
  return res.json(category)
}
```

Atualize `errorMiddleware.ts`:

```typescript
import { AppError } from '../errors/AppError.js'

const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Erro customizado da aplicação
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      ...(err instanceof ValidationError && { issues: err.issues }),
    })
  }
  
  // Erro do Prisma
  if (err.code && err.code.startsWith('P')) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Registro não encontrado' })
    }
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Registro duplicado' })
    }
    return res.status(400).json({ error: 'Erro no banco de dados' })
  }
  
  // Erro de validação Zod
  if (err.issues) {
    return res.status(400).json({
      error: 'Erro de validação',
      issues: err.issues,
    })
  }
  
  // Erro desconhecido
  console.error('Erro não tratado:', err)
  return res.status(500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Erro interno do servidor' 
      : err.message,
  })
}
```

---

### 4.2. Try-Catch Assíncrono Wrapper

**Problema:** Repetição de try-catch em todos os controllers.

**Como melhorar:**

Crie `backend/src/utils/asyncHandler.ts`:

```typescript
import { Request, Response, NextFunction } from 'express'

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
```

Use nos controllers:

```typescript
import { asyncHandler } from '../utils/asyncHandler.js'

const index = asyncHandler(async (req: Request, res: Response) => {
  // código sem try-catch
  const result = await categoryService.findAll({...})
  return res.json(result)
})

// Nas rotas
router.get('/categories', asyncHandler(index))
```

---

## 5. Backend - Validações

### 5.1. Validação de CNPJ

**Problema:** CNPJ não é validado corretamente.

**Como melhorar:**

Crie `backend/src/utils/validateCNPJ.ts`:

```typescript
export function validateCNPJ(cnpj: string): boolean {
  // Remove caracteres não numéricos
  const cleanCNPJ = cnpj.replace(/\D/g, '')
  
  if (cleanCNPJ.length !== 14) return false
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cleanCNPJ)) return false
  
  // Validação dos dígitos verificadores
  let length = cleanCNPJ.length - 2
  let numbers = cleanCNPJ.substring(0, length)
  const digits = cleanCNPJ.substring(length)
  let sum = 0
  let pos = length - 7
  
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--
    if (pos < 2) pos = 9
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (result !== parseInt(digits.charAt(0))) return false
  
  length = length + 1
  numbers = cleanCNPJ.substring(0, length)
  sum = 0
  pos = length - 7
  
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--
    if (pos < 2) pos = 9
  }
  
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (result !== parseInt(digits.charAt(1))) return false
  
  return true
}
```

Use na validação:

```typescript
import { z } from 'zod'
import { validateCNPJ } from '../utils/validateCNPJ.js'

export const createSupplierSchema = z.object({
  name: z.string().min(1),
  cnpj: z.string().refine(validateCNPJ, {
    message: 'CNPJ inválido',
  }),
  // ...
})
```

---

### 5.2. Validação de Código de Barras

**Problema:** Código de barras não é validado.

**Como melhorar:**

Atualize `backend/src/validations/productsValidation.ts`:

```typescript
import { z } from 'zod'

const barcodeSchema = z.string().refine(
  (val) => {
    if (!val) return true // opcional
    const clean = val.replace(/\D/g, '')
    return clean.length >= 8 && clean.length <= 13
  },
  { message: 'Código de barras inválido (deve ter entre 8 e 13 dígitos)' }
)

export const createProductSchema = z.object({
  name: z.string().min(1),
  barcode: barcodeSchema.optional(),
  // ...
})
```

---

## 6. Backend - Testes

### 6.1. Aumentar Cobertura de Testes

**Problema:** Poucos testes existentes.

**Como melhorar:**

Crie testes para services:

`backend/src/services/__tests__/categoryService.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { categoryService } from '../categoryService'
import { prisma } from '../../lib/prisma'

describe('CategoryService', () => {
  beforeEach(async () => {
    // Limpar dados de teste
    await prisma.category.deleteMany()
  })
  
  it('deve criar uma categoria', async () => {
    const category = await categoryService.create({
      name: 'Bebidas',
      description: 'Refrigerantes e sucos',
    })
    
    expect(category).toHaveProperty('id')
    expect(category.name).toBe('Bebidas')
  })
  
  it('deve listar categorias com paginação', async () => {
    // Criar várias categorias
    await Promise.all([
      categoryService.create({ name: 'Categoria 1' }),
      categoryService.create({ name: 'Categoria 2' }),
      categoryService.create({ name: 'Categoria 3' }),
    ])
    
    const result = await categoryService.findAll({ page: 1, limit: 2 })
    
    expect(result.data).toHaveLength(2)
    expect(result.pagination.total).toBe(3)
    expect(result.pagination.totalPages).toBe(2)
  })
  
  it('deve buscar categoria por ID', async () => {
    const created = await categoryService.create({ name: 'Teste' })
    const found = await categoryService.findById(created.id)
    
    expect(found).not.toBeNull()
    expect(found?.name).toBe('Teste')
  })
})
```

---

### 6.2. Testes de Integração

**Problema:** Falta de testes de integração para fluxos completos.

**Como melhorar:**

Crie `backend/src/__tests__/integration/auth.test.ts`:

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { app } from '../../server'
import { prisma } from '../../lib/prisma'

describe('Auth Integration', () => {
  beforeAll(async () => {
    // Setup: criar usuário de teste
  })
  
  afterAll(async () => {
    // Cleanup: remover dados de teste
  })
  
  it('deve registrar e fazer login', async () => {
    // Registrar
    const registerRes = await request(app)
      .post('/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Test123!@#',
        role: 'OPERATOR',
      })
    
    expect(registerRes.status).toBe(201)
    
    // Login
    const loginRes = await request(app)
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Test123!@#',
      })
    
    expect(loginRes.status).toBe(200)
    expect(loginRes.body).toHaveProperty('token')
    expect(loginRes.body).toHaveProperty('user')
  })
})
```

---

## 7. Frontend - Organização e Componentes

### 7.1. Criar Hooks Customizados

**Problema:** Lógica repetida entre componentes (ex: fetch de dados).

**Como melhorar:**

Crie `frontend/src/hooks/useProducts.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'

interface Product {
  id: number
  name: string
  // ... outros campos
}

interface ProductsFilters {
  search?: string
  categoryId?: string
  supplierId?: string
  active?: boolean | ''
  page?: number
  limit?: number
}

export function useProducts(filters: ProductsFilters = {}) {
  const { page = 1, limit = 10, ...restFilters } = filters
  
  return useQuery({
    queryKey: ['products', page, limit, restFilters],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })
      
      if (restFilters.search) params.append('search', restFilters.search)
      if (restFilters.categoryId) params.append('categoryId', restFilters.categoryId)
      if (restFilters.supplierId) params.append('supplierId', restFilters.supplierId)
      if (restFilters.active !== undefined && restFilters.active !== '') {
        params.append('active', restFilters.active.toString())
      }
      
      const response = await api.get(`/products?${params}`)
      return response.data
    },
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: Partial<Product>) => {
      const response = await api.post('/products', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Product> }) => {
      const response = await api.put(`/products/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/products/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}
```

Use no componente:

```typescript
import { useProducts, useCreateProduct } from '../hooks/useProducts'

export function Products() {
  const { data, isLoading } = useProducts({ page: 1, search: 'coca' })
  const createMutation = useCreateProduct()
  
  // ... resto do componente
}
```

---

### 7.2. Componentes Reutilizáveis

**Problema:** Código duplicado em modais e formulários.

**Como melhorar:**

Crie `frontend/src/components/Modal.tsx`:

```typescript
import { ReactNode } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
```

Crie `frontend/src/components/FormField.tsx`:

```typescript
interface FormFieldProps {
  label: string
  name: string
  type?: string
  required?: boolean
  defaultValue?: string | number
  placeholder?: string
  children?: ReactNode
}

export function FormField({
  label,
  name,
  type = 'text',
  required,
  defaultValue,
  placeholder,
  children,
}: FormFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && '*'}
      </label>
      {children || (
        <input
          type={type}
          name={name}
          required={required}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      )}
    </div>
  )
}
```

---

### 7.3. Context para Autenticação

**Problema:** Estado de autenticação gerenciado apenas via localStorage.

**Como melhorar:**

Crie `frontend/src/contexts/AuthContext.tsx`:

```typescript
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: number
  name: string
  email: string
  role: 'ADMIN' | 'OPERATOR'
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (token: string, user: User) => void
  logout: () => void
  isAuthenticated: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  
  useEffect(() => {
    // Carregar do localStorage na inicialização
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
  }, [])
  
  const login = (newToken: string, newUser: User) => {
    setToken(newToken)
    setUser(newUser)
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
  }
  
  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }
  
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === 'ADMIN',
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}
```

Use no `main.tsx`:

```typescript
import { AuthProvider } from './contexts/AuthContext'

root.render(
  <AuthProvider>
    <App />
  </AuthProvider>
)
```

---

## 8. Frontend - UX/UI

### 8.1. Loading States e Skeleton Screens

**Problema:** Apenas texto "Carregando..." sem feedback visual adequado.

**Como melhorar:**

Crie `frontend/src/components/Skeleton.tsx`:

```typescript
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  )
}

export function ProductSkeleton() {
  return (
    <div className="px-6 py-4 border-b">
      <Skeleton className="h-4 w-1/3 mb-2" />
      <Skeleton className="h-3 w-1/2 mb-2" />
      <Skeleton className="h-3 w-1/4" />
    </div>
  )
}
```

Use no componente:

```typescript
{isLoading ? (
  <>
    {[...Array(5)].map((_, i) => (
      <ProductSkeleton key={i} />
    ))}
  </>
) : (
  // ... lista de produtos
)}
```

---

### 8.2. Toast/Notificações

**Problema:** Falta feedback visual para ações (sucesso, erro).

**Como melhorar:**

Instale: `npm install react-hot-toast`

Configure no `main.tsx`:

```typescript
import { Toaster } from 'react-hot-toast'

root.render(
  <>
    <App />
    <Toaster position="top-right" />
  </>
)
```

Use nos componentes:

```typescript
import toast from 'react-hot-toast'

const handleSubmit = async (data: ProductData) => {
  try {
    await createMutation.mutateAsync(data)
    toast.success('Produto criado com sucesso!')
  } catch (error) {
    toast.error('Erro ao criar produto')
  }
}
```

---

### 8.3. Debounce na Busca

**Problema:** Busca faz requisição a cada tecla digitada.

**Como melhorar:**

Crie `frontend/src/hooks/useDebounce.ts`:

```typescript
import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])
  
  return debouncedValue
}
```

Use no componente:

```typescript
const [search, setSearch] = useState('')
const debouncedSearch = useDebounce(search, 500)

const { data } = useProducts({ search: debouncedSearch })
```

---

## 9. Geral - Configuração e DevOps

### 9.1. Variáveis de Ambiente com Validação

**Problema:** Falta arquivo `.env.example` e validação.

**Como melhorar:**

Crie `backend/.env.example`:

```env
# Server
PORT=3333
NODE_ENV=development

# Database
DATABASE_URL=postgresql://usuario:senha@localhost:5432/stockmaster

# JWT
JWT_SECRET=sua-chave-secreta-com-pelo-menos-32-caracteres-aqui
JWT_EXPIRES_IN=7d

# CORS (opcional)
CORS_ORIGIN=http://localhost:5173
```

Crie `frontend/.env.example`:

```env
VITE_API_URL=http://localhost:3333
```

---

### 9.2. Scripts Úteis no package.json

**Problema:** Falta scripts para tarefas comuns.

**Como melhorar:**

Adicione ao `backend/package.json`:

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio",
    "db:seed": "tsx src/prisma/seed.ts",
    "lint": "eslint src --ext .ts",
    "lint:fix": "eslint src --ext .ts --fix",
    "type-check": "tsc --noEmit"
  }
}
```

---

### 9.3. Docker Compose para Desenvolvimento

**Problema:** Docker Compose pode ser melhorado para desenvolvimento.

**Como melhorar:**

Atualize `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: stockmaster-db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: stockmaster
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: stockmaster-backend
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/stockmaster
      PORT: 3333
      JWT_SECRET: dev-secret-key-change-in-production
      NODE_ENV: development
    ports:
      - "3333:3333"
    volumes:
      - ./backend/src:/app/src  # Hot reload
      - ./backend/prisma:/app/prisma
    depends_on:
      postgres:
        condition: service_healthy
    command: sh -c "npx prisma generate && npx prisma db push && npm run dev"

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: stockmaster-frontend
    ports:
      - "5173:5173"
    volumes:
      - ./frontend/src:/app/src  # Hot reload
    environment:
      VITE_API_URL: http://localhost:3333
    command: npm run dev

volumes:
  postgres_data:
```

---

### 9.4. Pre-commit Hooks

**Problema:** Código pode ser commitado com erros.

**Como melhorar:**

Instale: `npm install --save-dev husky lint-staged`

Configure no `package.json`:

```json
{
  "lint-staged": {
    "*.ts": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

Crie `.husky/pre-commit`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
npm run type-check
```

---

## 📊 Priorização das Melhorias

### 🔴 Alta Prioridade (Segurança e Estabilidade)
1. Validação de variáveis de ambiente
2. Rate limiting
3. Validação de senha forte
4. Classes de erro customizadas
5. Try-catch wrapper

### 🟡 Média Prioridade (Performance e UX)
6. Cache de consultas
7. Hooks customizados no frontend
8. Componentes reutilizáveis
9. Toast/Notificações
10. Debounce na busca

### 🟢 Baixa Prioridade (Melhorias Incrementais)
11. Cursor-based pagination
12. Índices no banco
13. Skeleton screens
14. Context de autenticação
15. Pre-commit hooks

---

## 🎯 Próximos Passos

1. **Escolha 2-3 melhorias** para começar
2. **Implemente uma de cada vez** e teste bem
3. **Commit após cada melhoria** funcionando
4. **Peça code review** se possível
5. **Documente** as mudanças feitas

---

**Boa sorte com as melhorias! 🚀**
