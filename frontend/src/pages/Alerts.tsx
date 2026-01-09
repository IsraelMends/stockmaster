import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'

interface Alert {
  id: number
  productId: number
  type: 'LOW_STOCK' | 'EXPIRING'
  message: string
  read: boolean
  createdAt: string
  product?: { id: number; name: string; currentStock: number; minimumStock: number }
}

export function Alerts() {
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
    },
  })

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      return api.put('/alerts/read-all')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })

  const unreadCount = data?.filter((alert: Alert) => !alert.read).length || 0

  const getAlertTypeLabel = (type: string) => {
    return type === 'LOW_STOCK' ? 'Estoque Baixo' : 'Vencendo'
  }

  const getAlertTypeColor = (type: string) => {
    return type === 'LOW_STOCK' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Alertas</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              {unreadCount} alerta{unreadCount > 1 ? 's' : ''} não lido{unreadCount > 1 ? 's' : ''}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isPending}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
          >
            {markAllAsReadMutation.isPending ? 'Marcando...' : 'Marcar Todos como Lidos'}
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">Carregando alertas...</div>
        </div>
      ) : data?.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <p className="text-gray-500">Nenhum alerta encontrado</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {data?.map((alert: Alert) => (
              <li
                key={alert.id}
                className={`px-6 py-4 ${!alert.read ? 'bg-yellow-50' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAlertTypeColor(alert.type)}`}
                      >
                        {getAlertTypeLabel(alert.type)}
                      </span>
                      {!alert.read && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Novo
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-900 mt-2">
                      {alert.product?.name}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{alert.message}</p>
                    {alert.type === 'LOW_STOCK' && alert.product && (
                      <p className="text-sm text-gray-500 mt-1">
                        Estoque atual: {alert.product.currentStock} | 
                        Estoque mínimo: {alert.product.minimumStock}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(alert.createdAt).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  {!alert.read && (
                    <button
                      onClick={() => markAsReadMutation.mutate(alert.id)}
                      disabled={markAsReadMutation.isPending}
                      className="ml-4 text-sm font-medium text-indigo-600 hover:text-indigo-900 disabled:opacity-50"
                    >
                      Marcar como lido
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
