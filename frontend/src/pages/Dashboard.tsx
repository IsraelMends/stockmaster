import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Package,
  AlertTriangle,
  Bell,
  DollarSign,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Activity
} from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../lib/api'
import { CardSkeleton } from '../components/Skeleton'

const COLORS = ['#8b5cf6', '#06b6d4', '#ec4899', '#f59e0b', '#10b981']

export function Dashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await api.get('/dashboard')
      return response.data
    },
  })

  const { data: movementsData } = useQuery({
    queryKey: ['dashboard', 'movements'],
    queryFn: async () => {
      const response = await api.get('/dashboard/movements-by-type')
      return response.data
    },
    enabled: !!data,
  })

  const { data: categoryData } = useQuery({
    queryKey: ['dashboard', 'categories'],
    queryFn: async () => {
      const response = await api.get('/dashboard/value-by-category')
      return response.data
    },
    enabled: !!data,
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-strong rounded-2xl p-6 border border-red-500/30"
      >
        <div className="text-red-300 text-center">Erro ao carregar dashboard</div>
      </motion.div>
    )
  }

  const stats = [
    {
      name: 'Total de Produtos',
      value: data?.totalProducts || 0,
      icon: Package,
      color: 'from-blue-500 to-cyan-500',
      change: '+12%',
      trend: 'up' as const,
    },
    {
      name: 'Estoque Baixo',
      value: data?.lowStockCount || 0,
      icon: AlertTriangle,
      color: 'from-orange-500 to-red-500',
      change: data?.lowStockCount > 0 ? 'Atenção!' : 'OK',
      trend: data?.lowStockCount > 0 ? ('down' as const) : ('up' as const),
    },
    {
      name: 'Alertas Não Lidos',
      value: data?.totalUnreadAlerts || 0,
      icon: Bell,
      color: 'from-purple-500 to-pink-500',
      change: data?.totalUnreadAlerts > 0 ? `${data?.totalUnreadAlerts} novos` : 'Nenhum',
      trend: 'neutral' as const,
    },
    {
      name: 'Valor Total',
      value: `R$ ${data?.totalStockValue?.toFixed(2) || '0.00'}`,
      icon: DollarSign,
      color: 'from-green-500 to-emerald-500',
      change: '+8.2%',
      trend: 'up' as const,
    },
  ]

  const pieData = categoryData?.map((cat: any) => ({
    name: cat.name,
    value: parseFloat(cat.totalValue || 0),
  })) || []

  const barData = movementsData ? [
    { name: 'Entradas', value: movementsData.entries || 0 },
    { name: 'Saídas', value: movementsData.exits || 0 },
    { name: 'Ajustes', value: movementsData.adjustments || 0 },
  ] : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Visão geral do seu estoque</p>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="glass-strong rounded-xl p-4 border border-white/20"
        >
          <Activity className="w-8 h-8 text-purple-400" />
        </motion.div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="glass-strong rounded-2xl p-6 border border-white/20 card-hover relative overflow-hidden group"
            >
              {/* Gradient background on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  {stat.trend === 'up' && (
                    <div className="flex items-center text-green-400 text-sm font-semibold">
                      <ArrowUp className="w-4 h-4 mr-1" />
                      {stat.change}
                    </div>
                  )}
                  {stat.trend === 'down' && (
                    <div className="flex items-center text-red-400 text-sm font-semibold">
                      <ArrowDown className="w-4 h-4 mr-1" />
                      {stat.change}
                    </div>
                  )}
                  {stat.trend === 'neutral' && (
                    <div className="text-gray-400 text-sm font-semibold">
                      {stat.change}
                    </div>
                  )}
                </div>
                <h3 className="text-gray-400 text-sm font-medium mb-1">{stat.name}</h3>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>

              {/* Shine effect */}
              <div className="absolute inset-0 -top-full group-hover:top-full transition-all duration-700 bg-gradient-to-b from-transparent via-white/10 to-transparent" />
            </motion.div>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart - Value by Category */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-strong rounded-2xl p-6 border border-white/20"
        >
          <h3 className="text-xl font-bold text-white mb-4">Valor por Categoria</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  formatter={(value: number | undefined) => `R$ ${value ? value.toFixed(2) : '0.00'}`}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              Nenhum dado disponível
            </div>
          )}
        </motion.div>

        {/* Bar Chart - Movements */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-strong rounded-2xl p-6 border border-white/20"
        >
          <h3 className="text-xl font-bold text-white mb-4">Movimentações por Tipo</h3>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              Nenhum dado disponível
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Movements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-strong rounded-2xl p-6 border border-white/20"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Movimentações Recentes</h3>
          <TrendingUp className="w-5 h-5 text-purple-400" />
        </div>
        {data?.recentMovements?.length > 0 ? (
          <div className="space-y-3">
            {data.recentMovements.map((movement: any, index: number) => (
              <motion.div
                key={movement.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.05 }}
                className="glass rounded-xl p-4 border border-white/10 hover:border-purple-500/50 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      movement.type === 'ENTRY' 
                        ? 'bg-green-500/20 text-green-400' 
                        : movement.type === 'EXIT'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {movement.type === 'ENTRY' ? (
                        <ArrowUp className="w-6 h-6" />
                      ) : movement.type === 'EXIT' ? (
                        <ArrowDown className="w-6 h-6" />
                      ) : (
                        <Activity className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <p className="text-white font-semibold">{movement.product?.name || 'Produto'}</p>
                      <p className="text-gray-400 text-sm">
                        {movement.type} - {movement.reason} • Qtd: {movement.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-sm">
                      {new Date(movement.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {new Date(movement.createdAt).toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            Nenhuma movimentação recente
          </div>
        )}
      </motion.div>
    </div>
  )
}
