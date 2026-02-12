'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, X, Edit2, Trash2, Package as PackageIcon, Loader2 } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { Layout } from '@/components/layout/Layout'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ProductSkeleton } from '@/components/ui/Skeleton'

interface Product {
  id: number
  name: string
  barcode?: string
  description?: string
  costPrice: number
  salePrice: number
  currentStock: number
  minimumStock: number
  unit: 'UN' | 'KG' | 'LT' | 'PCT' | 'CX'
  categoryId: number
  supplierId: number
  active: boolean
  category?: { id: number; name: string }
  supplier?: { id: number; name: string }
}

interface Category {
  id: number
  name: string
}

interface Supplier {
  id: number
  name: string
}

export default function ProductsPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [supplierFilter, setSupplierFilter] = useState('')
  const [activeFilter, setActiveFilter] = useState<string>('')
  const [page, setPage] = useState(1)
  const limit = 10

  const { data, isLoading } = useQuery({
    queryKey: ['products', page, search, categoryFilter, supplierFilter, activeFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })
      if (search) params.append('search', search)
      if (categoryFilter) params.append('categoryId', categoryFilter)
      if (supplierFilter) params.append('supplierId', supplierFilter)
      if (activeFilter !== '') params.append('active', activeFilter)

      const response = await api.get(`/products?${params}`)
      return response.data
    },
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/categories')
      return Array.isArray(response.data?.data) ? response.data.data : response.data ?? []
    },
  })

  const { data: suppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const response = await api.get('/suppliers')
      return Array.isArray(response.data?.data) ? response.data.data : response.data ?? []
    },
  })

  const productMutation = useMutation({
    mutationFn: async (productData: Partial<Product> & { id?: number }) => {
      if (editingProduct) {
        return await api.put(`/products/${editingProduct.id}`, productData)
      } else {
        return await api.post('/products', productData)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setIsModalOpen(false)
      setEditingProduct(null)
      toast.success(editingProduct ? 'Produto atualizado com sucesso!' : 'Produto criado com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao salvar produto. Tente novamente.')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await api.delete(`/products/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Produto desativado com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao desativar produto. Tente novamente.')
    },
  })

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  const handleDelete = (id: number) => {
    if (confirm('Deseja realmente desativar este produto?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const productData: Partial<Product> = {
      name: formData.get('name') as string,
      barcode: (formData.get('barcode') as string) || undefined,
      description: (formData.get('description') as string) || undefined,
      costPrice: parseFloat(formData.get('costPrice') as string),
      salePrice: parseFloat(formData.get('salePrice') as string),
      currentStock: parseInt(formData.get('currentStock') as string) || 0,
      minimumStock: parseInt(formData.get('minimumStock') as string) || 0,
      unit: formData.get('unit') as Product['unit'],
      categoryId: parseInt(formData.get('categoryId') as string),
      supplierId: parseInt(formData.get('supplierId') as string),
      active: formData.get('active') === 'true',
    }
    productMutation.mutate(productData)
  }

  const totalPages = data?.totalPages || 1

  return (
    <Layout>
      <PageHeader
        title="Produtos"
        description="Gerencie seu inventário de produtos"
        actions={
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={() => {
                setEditingProduct(null)
                setIsModalOpen(true)
              }}
            >
              <Plus className="w-5 h-5" />
              Novo Produto
            </Button>
          </motion.div>
        }
      />

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                placeholder="Buscar por nome ou código..."
                className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border-2 border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value)
                setPage(1)
              }}
              className="w-full px-4 py-2.5 bg-muted/50 border-2 border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
            >
              <option value="">Todas as categorias</option>
              {categories?.map((cat: Category) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <select
              value={supplierFilter}
              onChange={(e) => {
                setSupplierFilter(e.target.value)
                setPage(1)
              }}
              className="w-full px-4 py-2.5 bg-muted/50 border-2 border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
            >
              <option value="">Todos os fornecedores</option>
              {suppliers?.map((sup: Supplier) => (
                <option key={sup.id} value={sup.id}>
                  {sup.name}
                </option>
              ))}
            </select>

            <select
              value={activeFilter}
              onChange={(e) => {
                setActiveFilter(e.target.value)
                setPage(1)
              }}
              className="w-full px-4 py-2.5 bg-muted/50 border-2 border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
            >
              <option value="">Todos os status</option>
              <option value="true">Ativos</option>
              <option value="false">Inativos</option>
            </select>
          </div>
        </Card>
      </motion.div>

      {/* Products List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      ) : data?.data?.length === 0 ? (
        <Card className="p-12 text-center">
          <PackageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhum produto encontrado</p>
        </Card>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="overflow-hidden">
              <div className="divide-y divide-border">
                {data?.data?.map((product: Product, index: number) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    whileHover={{ x: 4 }}
                    className="p-4 sm:p-6 hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-semibold text-foreground">{product.name}</h3>
                          {!product.active && <Badge variant="danger">Inativo</Badge>}
                          {product.currentStock <= product.minimumStock && (
                            <Badge variant="warning">Estoque Baixo</Badge>
                          )}
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span>
                            {product.category?.name} • {product.supplier?.name}
                          </span>
                          <span>
                            Estoque: {product.currentStock} {product.unit}
                          </span>
                          {product.barcode && <span>Code: {product.barcode}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-bold text-foreground">
                            R$ {product.salePrice.toFixed(2)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Custo: R$ {product.costPrice.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEdit(product)}
                            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-5 h-5" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDelete(product.id)}
                            className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Desativar"
                          >
                            <Trash2 className="w-5 h-5" />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              <div className="text-sm text-muted-foreground">
                Página {page} de {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Próxima
                </Button>
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsModalOpen(false)
                setEditingProduct(null)
              }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 overflow-y-auto p-4"
            >
              <div className="flex min-h-full items-center justify-center">
                <Card className="relative w-full max-w-2xl border-2 border-border">
                  <div className="flex items-center justify-between p-6 border-b border-border">
                    <h3 className="text-xl font-bold text-foreground">
                      {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                    </h3>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setIsModalOpen(false)
                        setEditingProduct(null)
                      }}
                      className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  </div>

                  <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-foreground mb-2">
                            Nome *
                          </label>
                          <input
                            type="text"
                            name="name"
                            required
                            defaultValue={editingProduct?.name}
                            className="w-full px-4 py-2.5 bg-muted/50 border-2 border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-foreground mb-2">
                            Código de Barras
                          </label>
                          <input
                            type="text"
                            name="barcode"
                            defaultValue={editingProduct?.barcode}
                            className="w-full px-4 py-2.5 bg-muted/50 border-2 border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                          Descrição
                        </label>
                        <textarea
                          name="description"
                          rows={3}
                          defaultValue={editingProduct?.description}
                          className="w-full px-4 py-2.5 bg-muted/50 border-2 border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-foreground mb-2">
                            Preço de Custo *
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            name="costPrice"
                            required
                            defaultValue={editingProduct?.costPrice}
                            className="w-full px-4 py-2.5 bg-muted/50 border-2 border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-foreground mb-2">
                            Preço de Venda *
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            name="salePrice"
                            required
                            defaultValue={editingProduct?.salePrice}
                            className="w-full px-4 py-2.5 bg-muted/50 border-2 border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-foreground mb-2">
                            Estoque Atual *
                          </label>
                          <input
                            type="number"
                            name="currentStock"
                            required
                            defaultValue={editingProduct?.currentStock}
                            className="w-full px-4 py-2.5 bg-muted/50 border-2 border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-foreground mb-2">
                            Estoque Mínimo
                          </label>
                          <input
                            type="number"
                            name="minimumStock"
                            defaultValue={editingProduct?.minimumStock || 0}
                            className="w-full px-4 py-2.5 bg-muted/50 border-2 border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-foreground mb-2">
                            Unidade *
                          </label>
                          <select
                            name="unit"
                            required
                            defaultValue={editingProduct?.unit}
                            className="w-full px-4 py-2.5 bg-muted/50 border-2 border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
                          >
                            <option value="UN">Unidade (UN)</option>
                            <option value="KG">Quilograma (KG)</option>
                            <option value="LT">Litro (LT)</option>
                            <option value="PCT">Pacote (PCT)</option>
                            <option value="CX">Caixa (CX)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-foreground mb-2">
                            Categoria *
                          </label>
                          <select
                            name="categoryId"
                            required
                            defaultValue={editingProduct?.categoryId}
                            className="w-full px-4 py-2.5 bg-muted/50 border-2 border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
                          >
                            <option value="">Selecione...</option>
                            {categories?.map((cat: Category) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-foreground mb-2">
                            Fornecedor *
                          </label>
                          <select
                            name="supplierId"
                            required
                            defaultValue={editingProduct?.supplierId}
                            className="w-full px-4 py-2.5 bg-muted/50 border-2 border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
                          >
                            <option value="">Selecione...</option>
                            {suppliers?.map((sup: Supplier) => (
                              <option key={sup.id} value={sup.id}>
                                {sup.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {editingProduct && (
                        <div>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              name="active"
                              value="true"
                              defaultChecked={editingProduct.active}
                              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-foreground">Produto ativo</span>
                          </label>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-border">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          setIsModalOpen(false)
                          setEditingProduct(null)
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={productMutation.isPending}>
                        {productMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Salvando...
                          </>
                        ) : (
                          'Salvar'
                        )}
                      </Button>
                    </div>
                  </form>
                </Card>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </Layout>
  )
}
