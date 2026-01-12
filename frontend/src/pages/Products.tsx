import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, X, Edit2, Trash2, Package as PackageIcon } from 'lucide-react'
import api from '../lib/api'
import { ProductSkeleton } from '../components/Skeleton'
import toast from 'react-hot-toast'

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

export function Products() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [supplierFilter, setSupplierFilter] = useState('')
  const [activeFilter, setActiveFilter] = useState<string>('')
  const [page, setPage] = useState(1)
  const limit = 10

  // Fetch products
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

  // Fetch categories for filter and form
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/categories')
      return response.data
    },
  })

  // Fetch suppliers for filter and form
  const { data: suppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const response = await api.get('/suppliers')
      return response.data
    },
  })

  // Create/Update product mutation
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

  // Delete product mutation
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
      barcode: formData.get('barcode') as string || undefined,
      description: formData.get('description') as string || undefined,
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Produtos</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Gerencie seu inventário</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setEditingProduct(null)
            setIsModalOpen(true)
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-semibold rounded-lg shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-200"
        >
          <Plus className="w-5 h-5" />
          Novo Produto
        </motion.button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Buscar por nome ou código..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-400 focus:border-transparent transition-all text-sm"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value)
              setPage(1)
            }}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-400 focus:border-transparent transition-all text-sm"
          >
            <option value="">Todas as categorias</option>
            {categories?.map((cat: Category) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Supplier Filter */}
          <select
            value={supplierFilter}
            onChange={(e) => {
              setSupplierFilter(e.target.value)
              setPage(1)
            }}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-400 focus:border-transparent transition-all text-sm"
          >
            <option value="">Todos os fornecedores</option>
            {suppliers?.map((sup: Supplier) => (
              <option key={sup.id} value={sup.id}>
                {sup.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={activeFilter}
            onChange={(e) => {
              setActiveFilter(e.target.value)
              setPage(1)
            }}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-400 focus:border-transparent transition-all text-sm"
          >
            <option value="">Todos os status</option>
            <option value="true">Ativos</option>
            <option value="false">Inativos</option>
          </select>
        </div>
      </div>

      {/* Products List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      ) : data?.data?.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center shadow-sm">
          <PackageIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Nenhum produto encontrado</p>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {data?.data?.map((product: Product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 sm:p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                          {product.name}
                        </h3>
                        {!product.active && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300">
                            Inativo
                          </span>
                        )}
                        {product.currentStock <= product.minimumStock && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300">
                            Estoque Baixo
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600 dark:text-slate-400">
                        <span>{product.category?.name} • {product.supplier?.name}</span>
                        <span>Estoque: {product.currentStock} {product.unit}</span>
                        {product.barcode && <span>Code: {product.barcode}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-slate-900 dark:text-white">
                          R$ {product.salePrice.toFixed(2)}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Custo: R$ {product.costPrice.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Desativar"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Página {page} de {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Próxima
                </button>
              </div>
            </div>
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
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 overflow-y-auto p-4"
            >
              <div className="flex min-h-full items-center justify-center">
                <div className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl">
                  {/* Header */}
                  <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                    </h3>
                    <button
                      onClick={() => {
                        setIsModalOpen(false)
                        setEditingProduct(null)
                      }}
                      className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-5">
                      {/* Name and Barcode */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Nome *
                          </label>
                          <input
                            type="text"
                            name="name"
                            required
                            defaultValue={editingProduct?.name}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-400 focus:border-transparent transition-all text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Código de Barras
                          </label>
                          <input
                            type="text"
                            name="barcode"
                            defaultValue={editingProduct?.barcode}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-400 focus:border-transparent transition-all text-sm"
                          />
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Descrição
                        </label>
                        <textarea
                          name="description"
                          rows={3}
                          defaultValue={editingProduct?.description}
                          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-400 focus:border-transparent transition-all text-sm resize-none"
                        />
                      </div>

                      {/* Prices */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Preço de Custo *
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            name="costPrice"
                            required
                            defaultValue={editingProduct?.costPrice}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-400 focus:border-transparent transition-all text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Preço de Venda *
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            name="salePrice"
                            required
                            defaultValue={editingProduct?.salePrice}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-400 focus:border-transparent transition-all text-sm"
                          />
                        </div>
                      </div>

                      {/* Stock */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Estoque Atual *
                          </label>
                          <input
                            type="number"
                            name="currentStock"
                            required
                            defaultValue={editingProduct?.currentStock}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-400 focus:border-transparent transition-all text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Estoque Mínimo
                          </label>
                          <input
                            type="number"
                            name="minimumStock"
                            defaultValue={editingProduct?.minimumStock || 0}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-400 focus:border-transparent transition-all text-sm"
                          />
                        </div>
                      </div>

                      {/* Unit, Category, Supplier */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Unidade *
                          </label>
                          <select
                            name="unit"
                            required
                            defaultValue={editingProduct?.unit}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-400 focus:border-transparent transition-all text-sm"
                          >
                            <option value="UN">Unidade (UN)</option>
                            <option value="KG">Quilograma (KG)</option>
                            <option value="LT">Litro (LT)</option>
                            <option value="PCT">Pacote (PCT)</option>
                            <option value="CX">Caixa (CX)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Categoria *
                          </label>
                          <select
                            name="categoryId"
                            required
                            defaultValue={editingProduct?.categoryId}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-400 focus:border-transparent transition-all text-sm"
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
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Fornecedor *
                          </label>
                          <select
                            name="supplierId"
                            required
                            defaultValue={editingProduct?.supplierId}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-400 focus:border-transparent transition-all text-sm"
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

                      {/* Active checkbox */}
                      {editingProduct && (
                        <div>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              name="active"
                              value="true"
                              defaultChecked={editingProduct.active}
                              className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-purple-600 focus:ring-purple-500 dark:focus:ring-purple-400 bg-slate-50 dark:bg-slate-900"
                            />
                            <span className="text-sm text-slate-700 dark:text-slate-300">Produto ativo</span>
                          </label>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={() => {
                          setIsModalOpen(false)
                          setEditingProduct(null)
                        }}
                        className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={productMutation.isPending}
                        className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-semibold rounded-lg shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        {productMutation.isPending ? 'Salvando...' : 'Salvar'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
