'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Package,
  AlertTriangle,
  Bell,
  DollarSign,
  ArrowUp,
  ArrowDown,
  Activity,
} from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import api from '@/lib/api'
import { Layout } from '@/components/layout/Layout'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { CardSkeleton } from '@/components/ui/Skeleton'

const COLORS = ['#8b5cf6', '#06b6d4', '#ec4899', '#f59e0b', '#10b981']

export default function DashboardPage() {
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
      <Layout>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <Card className="p-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
          <div className="text-red-800 dark:text-red-300 text-center">Erro ao carregar dashboard</div>
        </Card>
      </Layout>
    )
  }

  const stats = [
    {
      name: 'Total de Produtos',
      value: data?.totalProducts || 0,
      icon: Package,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400',
      change: '+12%',
      trend: 'up' as const,
    },
    {
      name: 'Estoque Baixo',
      value: data?.lowStockCount || 0,
      icon: AlertTriangle,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      textColor: 'text-orange-600 dark:text-orange-400',
      change: data?.lowStockCount > 0 ? 'Atenção!' : 'OK',
      trend: data?.lowStockCount > 0 ? ('down' as const) : ('up' as const),
    },
    {
      name: 'Alertas Não Lidos',
      value: data?.totalUnreadAlerts || 0,
      icon: Bell,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-600 dark:text-purple-400',
      change: data?.totalUnreadAlerts > 0 ? `${data?.totalUnreadAlerts} novos` : 'Nenhum',
      trend: 'neutral' as const,
    },
    {
      name: 'Valor Total',
      value: `R$ ${data?.totalStockValue?.toFixed(2) || '0.00'}`,
      icon: DollarSign,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-600 dark:text-green-400',
      change: '+8.2%',
      trend: 'up' as const,
    },
  ]

  const pieData = categoryData?.map((cat: any) => ({
    name: cat.name,
    value: parseFloat(cat.totalValue || 0),
  })) || []

  const barData = movementsData
    ? [
        { name: 'Entradas', value: movementsData.entries || 0 },
        { name: 'Saídas', value: movementsData.exits || 0 },
        { name: 'Ajustes', value: movementsData.adjustments || 0 },
      ]
    : []

  return (
    <Layout>
      <PageHeader title="Dashboard" description="Visão geral do seu estoque" />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <Card className="p-6 group cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center shadow-lg transition-all duration-300 group-hover:shadow-xl`}
                  >
                    <Icon className={`w-6 h-6 ${stat.textColor}`} />
                  </motion.div>
                  {stat.trend === 'up' && (
                    <div className="flex items-center text-emerald-600 dark:text-emerald-400 text-sm font-semibold">
                      <ArrowUp className="w-4 h-4 mr-1" />
                      {stat.change}
                    </div>
                  )}
                  {stat.trend === 'down' && (
                    <div className="flex items-center text-red-600 dark:text-red-400 text-sm font-semibold">
                      <ArrowDown className="w-4 h-4 mr-1" />
                      {stat.change}
                    </div>
                  )}
                  {stat.trend === 'neutral' && (
                    <div className="text-muted-foreground text-sm font-semibold">{stat.change}</div>
                  )}
                </div>
                <h3 className="text-muted-foreground text-sm font-medium mb-1">{stat.name}</h3>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          whileHover={{ y: -2 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">Valor por Categoria</h3>
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
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number | undefined) => `R$ ${value ? value.toFixed(2) : '0.00'}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </Card>
        </motion.div>

        {/* Bar Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          whileHover={{ y: -2 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">Movimentações por Tipo</h3>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Recent Movements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Movimentações Recentes</h3>
              <Activity className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
          {data?.recentMovements?.length > 0 ? (
            <div className="divide-y divide-border">
              {data.recentMovements.map((movement: any, index: number) => (
                <motion.div
                  key={movement.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.03 }}
                  className="px-6 py-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          movement.type === 'ENTRY'
                            ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                            : movement.type === 'EXIT'
                            ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                            : 'bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {movement.type === 'ENTRY' ? (
                          <ArrowUp className="w-5 h-5" />
                        ) : movement.type === 'EXIT' ? (
                          <ArrowDown className="w-5 h-5" />
                        ) : (
                          <Activity className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {movement.product?.name || 'Produto'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {movement.type} - {movement.reason} • Qtd: {movement.quantity}
                        </p>
                      </div>
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
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Nenhuma movimentação recente
            </div>
          )}
        </Card>
      </motion.div>
    </Layout>
  )
}
