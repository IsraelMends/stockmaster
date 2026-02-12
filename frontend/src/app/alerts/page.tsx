'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Bell, CheckCircle2, Loader2 } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { Layout } from '@/components/layout/Layout'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

interface Alert {
  id: number
  productId: number
  type: 'LOW_STOCK' | 'EXPIRING'
  message: string
  read: boolean
  createdAt: string
  product?: { id: number; name: string; currentStock: number; minimumStock: number }
}

export default function AlertsPage() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      const response = await api.get('/alerts')
      return response.data.data || []
    },
  })

  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.put(`/alerts/${id}/read`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Alerta marcado como lido!')
    },
    onError: () => {
      toast.error('Erro ao marcar alerta.')
    },
  })

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      return api.put('/alerts/read-all')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Todos os alertas foram marcados como lidos!')
    },
    onError: () => {
      toast.error('Erro ao marcar alertas.')
    },
  })

  const unreadCount = data?.filter((alert: Alert) => !alert.read).length || 0

  const getAlertTypeLabel = (type: string) => {
    return type === 'LOW_STOCK' ? 'Estoque Baixo' : 'Vencendo'
  }

  const getAlertTypeColor = (type: string) => {
    return type === 'LOW_STOCK' ? 'warning' : 'danger'
  }

  return (
    <Layout>
      <PageHeader
        title="Alertas"
        description={
          unreadCount > 0
            ? `${unreadCount} alerta${unreadCount > 1 ? 's' : ''} não lido${unreadCount > 1 ? 's' : ''}`
            : 'Nenhum alerta crítico no momento'
        }
        actions={
          unreadCount > 0 ? (
            <Button
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
            >
              {markAllAsReadMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Marcando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Marcar todos como lidos
                </>
              )}
            </Button>
          ) : undefined
        }
      />

      {isLoading ? (
        <Card className="p-8 flex items-center justify-center">
          <div className="text-muted-foreground">Carregando alertas...</div>
        </Card>
      ) : data?.length === 0 ? (
        <Card className="p-12 text-center">
          <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhum alerta encontrado</p>
        </Card>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="overflow-hidden">
            <div className="divide-y divide-border">
              {data?.map((alert: Alert, index: number) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={{ x: 4 }}
                  className={`px-6 py-4 hover:bg-muted/50 transition-colors ${
                    !alert.read ? 'bg-amber-50 dark:bg-amber-900/10' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={getAlertTypeColor(alert.type)}>
                          {getAlertTypeLabel(alert.type)}
                        </Badge>
                        {!alert.read && (
                          <Badge variant="info" className="ml-2">
                            Novo
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-foreground mt-2">
                        {alert.product?.name}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                      {alert.type === 'LOW_STOCK' && alert.product && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Estoque atual: {alert.product.currentStock} | Estoque mínimo:{' '}
                          {alert.product.minimumStock}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(alert.createdAt).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    {!alert.read && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => markAsReadMutation.mutate(alert.id)}
                        disabled={markAsReadMutation.isPending}
                        className="ml-4 p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}
    </Layout>
  )
}
