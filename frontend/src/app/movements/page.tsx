'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Move, ArrowUp, ArrowDown, Activity, Loader2 } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { Layout } from '@/components/layout/Layout'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

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

export default function MovementsPage() {
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
      toast.success('Movimentação registrada com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao registrar movimentação.')
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
      notes: (formData.get('notes') as string) || undefined,
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
    <Layout>
      <PageHeader
        title="Movimentações"
        description="Acompanhe entradas, saídas e ajustes de estoque"
        actions={
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-5 h-5" />
            Nova Movimentação
          </Button>
        }
      />

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Produto</label>
              <select
                value={productFilter}
                onChange={(e) => {
                  setProductFilter(e.target.value)
                  setPage(1)
                }}
                className="w-full px-4 py-2.5 bg-muted/50 border-2 border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
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
              <label className="block text-sm font-semibold text-foreground mb-2">Tipo</label>
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value)
                  setPage(1)
                }}
                className="w-full px-4 py-2.5 bg-muted/50 border-2 border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
              >
                <option value="">Todos</option>
                <option value="ENTRY">Entrada</option>
                <option value="EXIT">Saída</option>
                <option value="ADJUSTMENT">Ajuste</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Data Inicial</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value)
                  setPage(1)
                }}
                className="w-full px-4 py-2.5 bg-muted/50 border-2 border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Data Final</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value)
                  setPage(1)
                }}
                className="w-full px-4 py-2.5 bg-muted/50 border-2 border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
              />
            </div>
          </div>
        </Card>
      </motion.div>

      {isLoading ? (
        <Card className="p-8 flex items-center justify-center">
          <div className="text-muted-foreground">Carregando movimentações...</div>
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
                {data?.data?.map((movement: StockMovement, index: number) => (
                  <motion.div
                    key={movement.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    whileHover={{ x: 4 }}
                    className="px-6 py-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-semibold text-foreground">
                            {movement.product?.name}
                          </p>
                          <Badge
                            variant={
                              movement.type === 'ENTRY'
                                ? 'success'
                                : movement.type === 'EXIT'
                                ? 'danger'
                                : 'info'
                            }
                          >
                            {getTypeLabel(movement.type)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {getReasonLabel(movement.reason)} • Quantidade: {movement.quantity}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Estoque: {movement.previousStock} → {movement.currentStock}
                        </p>
                        {movement.notes && (
                          <p className="text-sm text-muted-foreground mt-1 italic">{movement.notes}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {new Date(movement.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(movement.createdAt).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        {movement.user && (
                          <p className="text-xs text-muted-foreground mt-1">Por: {movement.user.name}</p>
                        )}
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
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 overflow-y-auto p-4"
            >
              <div className="flex min-h-full items-center justify-center">
                <Card className="relative w-full max-w-md border-2 border-border">
                  <div className="flex items-center justify-between p-6 border-b border-border">
                    <h3 className="text-xl font-bold text-foreground">Nova Movimentação</h3>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsModalOpen(false)}
                      className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  </div>

                  <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Produto *
                      </label>
                      <select
                        name="productId"
                        required
                        className="w-full px-4 py-2.5 bg-muted/50 border-2 border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
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
                      <label className="block text-sm font-semibold text-foreground mb-2">Tipo *</label>
                      <select
                        name="type"
                        required
                        className="w-full px-4 py-2.5 bg-muted/50 border-2 border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
                      >
                        <option value="ENTRY">Entrada</option>
                        <option value="EXIT">Saída</option>
                        <option value="ADJUSTMENT">Ajuste</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Motivo *</label>
                      <select
                        name="reason"
                        required
                        className="w-full px-4 py-2.5 bg-muted/50 border-2 border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
                      >
                        <option value="PURCHASE">Compra</option>
                        <option value="SALE">Venda</option>
                        <option value="LOSS">Perda</option>
                        <option value="RETURN">Devolução</option>
                        <option value="ADJUSTMENT">Ajuste</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Quantidade *
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        required
                        min="1"
                        className="w-full px-4 py-2.5 bg-muted/50 border-2 border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Observações
                      </label>
                      <textarea
                        name="notes"
                        rows={3}
                        className="w-full px-4 py-2.5 bg-muted/50 border-2 border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm resize-none"
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                      <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={movementMutation.isPending}>
                        {movementMutation.isPending ? (
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
