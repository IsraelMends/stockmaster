import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'

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
  const [activeFilter, setActiveFilter] = useState<boolean | ''>('')
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
      if (activeFilter !== '') params.append('active', activeFilter.toString())
      
      const response = await api.get(`/products?${params}`)
      return response.data
    },
  })

  // Fetch categories for filter and form
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/categories')
      return response.data.data || []
    },
  })

  // Fetch suppliers for filter and form
  const { data: suppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const response = await api.get('/suppliers')
      return response.data.data || []
    },
  })

  // Create/Update mutation
  const productMutation = useMutation({
    mutationFn: async (productData: Partial<Product>) => {
      if (editingProduct) {
        return api.put(`/products/${editingProduct.id}`, productData)
      } else {
        return api.post('/products', productData)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setIsModalOpen(false)
      setEditingProduct(null)
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.delete(`/products/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja desativar este produto?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const productData = {
      name: formData.get('name') as string,
      barcode: formData.get('barcode') as string || undefined,
      description: formData.get('description') as string || undefined,
      costPrice: parseFloat(formData.get('costPrice') as string),
      salePrice: parseFloat(formData.get('salePrice') as string),
      currentStock: parseInt(formData.get('currentStock') as string),
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
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Produtos</h1>
        <button
          onClick={() => {
            setEditingProduct(null)
            setIsModalOpen(true)
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Novo Produto
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Nome ou código de barras"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoria
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value)
                setPage(1)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Todas</option>
              {categories?.map((cat: Category) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fornecedor
            </label>
            <select
              value={supplierFilter}
              onChange={(e) => {
                setSupplierFilter(e.target.value)
                setPage(1)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Todos</option>
              {suppliers?.map((sup: Supplier) => (
                <option key={sup.id} value={sup.id}>
                  {sup.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={activeFilter}
              onChange={(e) => {
                setActiveFilter(e.target.value === '' ? '' : e.target.value === 'true')
                setPage(1)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Todos</option>
              <option value="true">Ativos</option>
              <option value="false">Inativos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">Carregando produtos...</div>
        </div>
      ) : (
        <>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {data?.data?.map((product: Product) => (
                <li key={product.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900">
                          {product.name}
                        </p>
                        {!product.active && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Inativo
                          </span>
                        )}
                        {product.currentStock <= product.minimumStock && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Estoque Baixo
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {product.category?.name} • {product.supplier?.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Estoque: {product.currentStock} {product.unit} | Mínimo: {product.minimumStock} {product.unit}
                      </p>
                    </div>
                    <div className="ml-4 flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          R$ {product.salePrice.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Custo: R$ {product.costPrice.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-900 text-sm font-medium"
                        >
                          Desativar
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Página {page} de {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nome *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    defaultValue={editingProduct?.name}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Código de Barras
                  </label>
                  <input
                    type="text"
                    name="barcode"
                    defaultValue={editingProduct?.barcode}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Descrição
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    defaultValue={editingProduct?.description}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Preço de Custo *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="costPrice"
                      required
                      defaultValue={editingProduct?.costPrice}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Preço de Venda *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="salePrice"
                      required
                      defaultValue={editingProduct?.salePrice}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Estoque Atual *
                    </label>
                    <input
                      type="number"
                      name="currentStock"
                      required
                      defaultValue={editingProduct?.currentStock}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Estoque Mínimo
                    </label>
                    <input
                      type="number"
                      name="minimumStock"
                      defaultValue={editingProduct?.minimumStock || 0}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Unidade *
                  </label>
                  <select
                    name="unit"
                    required
                    defaultValue={editingProduct?.unit}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="UN">Unidade (UN)</option>
                    <option value="KG">Quilograma (KG)</option>
                    <option value="LT">Litro (LT)</option>
                    <option value="PCT">Pacote (PCT)</option>
                    <option value="CX">Caixa (CX)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Categoria *
                  </label>
                  <select
                    name="categoryId"
                    required
                    defaultValue={editingProduct?.categoryId}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories?.map((cat: Category) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Fornecedor *
                  </label>
                  <select
                    name="supplierId"
                    required
                    defaultValue={editingProduct?.supplierId}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Selecione um fornecedor</option>
                    {suppliers?.map((sup: Supplier) => (
                      <option key={sup.id} value={sup.id}>
                        {sup.name}
                      </option>
                    ))}
                  </select>
                </div>
                {editingProduct && (
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="active"
                        value="true"
                        defaultChecked={editingProduct.active}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Ativo</span>
                    </label>
                  </div>
                )}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false)
                      setEditingProduct(null)
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={productMutation.isPending}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {productMutation.isPending ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
