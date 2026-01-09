import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'

interface StockMovement {
  id: number
  productId: number
  userId: number
  type: 'ENTRY' | 'EXIT' | 'ADJUSTMENT'
  reason: 'PURCHASE' | 'SALE' | 'LOSS' | 'RETURN' | 'ADJUSTMENT'
  quantity: number
  previousStock: number
  currentStock: number
  notes?: string
  createdAt: string
  product?: { id: number; name: string }
  user?: { id: number; name: string }
}

interface Product {
  id: number
  name: string
}

export function Movements() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [productFilter, setProductFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [page, setPage] = useState(1)
  const limit = 10

  const { data, isLoading } = useQuery({
    queryKey: ['movements', page, productFilter, typeFilter, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })
      if (productFilter) params.append('productId', productFilter)
      if (typeFilter) params.append('type', typeFilter)
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      
      const response = await api.get(`/stock-movements?${params}`)
      return response.data
    },
  })

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await api.get('/products?limit=1000')
      return response.data.data || []
    },
  })

  const movementMutation = useMutation({
    mutationFn: async (movementData: any) => {
      return api.post('/stock-movements', movementData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movements'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      setIsModalOpen(false)
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const movementData = {
      productId: parseInt(formData.get('productId') as string),
      type: formData.get('type') as StockMovement['type'],
      reason: formData.get('reason') as StockMovement['reason'],
      quantity: parseInt(formData.get('quantity') as string),
      notes: formData.get('notes') as string || undefined,
    }
    movementMutation.mutate(movementData)
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      ENTRY: 'Entrada',
      EXIT: 'Saída',
      ADJUSTMENT: 'Ajuste',
    }
    return labels[type] || type
  }

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      PURCHASE: 'Compra',
      SALE: 'Venda',
      LOSS: 'Perda',
      RETURN: 'Devolução',
      ADJUSTMENT: 'Ajuste',
    }
    return labels[reason] || reason
  }

  const totalPages = data?.totalPages || 1

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Movimentações</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Nova Movimentação
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Produto
            </label>
            <select
              value={productFilter}
              onChange={(e) => {
                setProductFilter(e.target.value)
                setPage(1)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Todos</option>
              {products?.map((p: Product) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value)
                setPage(1)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Todos</option>
              <option value="ENTRY">Entrada</option>
              <option value="EXIT">Saída</option>
              <option value="ADJUSTMENT">Ajuste</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Inicial
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value)
                setPage(1)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Final
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value)
                setPage(1)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">Carregando movimentações...</div>
        </div>
      ) : (
        <>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {data?.data?.map((movement: StockMovement) => (
                <li key={movement.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {movement.product?.name}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {getTypeLabel(movement.type)} - {getReasonLabel(movement.reason)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Quantidade: {movement.quantity} | 
                        Estoque anterior: {movement.previousStock} → 
                        Estoque atual: {movement.currentStock}
                      </p>
                      {movement.notes && (
                        <p className="text-sm text-gray-400 mt-1 italic">
                          {movement.notes}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {new Date(movement.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(movement.createdAt).toLocaleTimeString('pt-BR')}
                      </p>
                      {movement.user && (
                        <p className="text-xs text-gray-400 mt-1">
                          Por: {movement.user.name}
                        </p>
                      )}
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Nova Movimentação
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Produto *
                  </label>
                  <select
                    name="productId"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Selecione um produto</option>
                    {products?.map((p: Product) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tipo *
                  </label>
                  <select
                    name="type"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="ENTRY">Entrada</option>
                    <option value="EXIT">Saída</option>
                    <option value="ADJUSTMENT">Ajuste</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Motivo *
                  </label>
                  <select
                    name="reason"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="PURCHASE">Compra</option>
                    <option value="SALE">Venda</option>
                    <option value="LOSS">Perda</option>
                    <option value="RETURN">Devolução</option>
                    <option value="ADJUSTMENT">Ajuste</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Quantidade *
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    required
                    min="1"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Observações
                  </label>
                  <textarea
                    name="notes"
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={movementMutation.isPending}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {movementMutation.isPending ? 'Salvando...' : 'Salvar'}
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
