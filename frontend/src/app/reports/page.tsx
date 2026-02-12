'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Download, BarChart3, Package, TrendingUp } from 'lucide-react'
import api from '@/lib/api'
import { Layout } from '@/components/layout/Layout'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function ReportsPage() {
  const [reportType, setReportType] = useState<'low-stock' | 'movements' | 'products-by-category'>(
    'low-stock'
  )
  const [format, setFormat] = useState<'json' | 'csv'>('json')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['reports', reportType, format, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams({ format })
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      const response = await api.get(`/reports/${reportType}?${params}`, {
        responseType: format === 'csv' ? 'blob' : 'json',
      })
      return response.data
    },
    enabled: true,
  })

  const handleDownload = () => {
    if (!data) return

    if (format === 'csv') {
      const blob = new Blob([data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${reportType}-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } else {
      const jsonStr = JSON.stringify(data, null, 2)
      const blob = new Blob([jsonStr], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${reportType}-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    }
  }

  const renderReportData = () => {
    if (isLoading) {
      return (
        <Card className="p-8 flex items-center justify-center">
          <div className="text-muted-foreground">Carregando relatório...</div>
        </Card>
      )
    }

    if (!data) {
      return (
        <Card className="p-12 text-center">
          <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Selecione um tipo de relatório</p>
        </Card>
      )
    }

    if (format === 'csv') {
      return (
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-4">
            Relatório gerado. Clique em &quot;Baixar&quot; para fazer o download.
          </p>
          <Button onClick={handleDownload}>
            <Download className="w-4 h-4" />
            Baixar CSV
          </Button>
        </Card>
      )
    }

    if (reportType === 'low-stock') {
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="overflow-hidden">
            <div className="divide-y divide-border">
              {data.data?.map((product: any, index: number) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={{ x: 4 }}
                  className="px-6 py-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{product.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {product.category?.name} | {product.supplier?.name}
                      </p>
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                        Estoque: {product.currentStock} {product.unit} | Mínimo:{' '}
                        {product.minimumStock} {product.unit}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">
                        R$ {product.salePrice?.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      )
    }

    if (reportType === 'movements') {
      return (
        <div className="space-y-6">
          {data.summary && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Resumo</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Movimentações</p>
                    <p className="text-2xl font-bold text-foreground">{data.summary.total}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Entradas</p>
                    <p className="text-2xl font-bold text-emerald-500">{data.summary.entries || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Saídas</p>
                    <p className="text-2xl font-bold text-red-500">{data.summary.exits || 0}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="overflow-hidden">
              <div className="divide-y divide-border">
                {data.data?.map((movement: any, index: number) => (
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
                        <p className="text-sm font-semibold text-foreground">
                          {movement.product?.name}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {movement.type} - {movement.reason} | Quantidade: {movement.quantity}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(movement.createdAt).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      )
    }

    if (reportType === 'products-by-category') {
      return (
        <div className="space-y-6">
          {data.data?.map((category: any, index: number) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">{category.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Total de produtos: {category.totalProducts} | Valor total: R${' '}
                  {category.totalValue?.toFixed(2)}
                </p>
                <ul className="divide-y divide-border">
                  {category.products?.map((product: any, pIndex: number) => (
                    <motion.li
                      key={product.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 + pIndex * 0.03 }}
                      className="py-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Estoque: {product.currentStock} {product.unit}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-foreground">
                          R$ {product.salePrice?.toFixed(2)}
                        </p>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          ))}
        </div>
      )
    }

    return null
  }

  return (
    <Layout>
      <PageHeader
        title="Relatórios"
        description="Gere relatórios de estoque, movimentações e categorias"
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Tipo de Relatório
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as any)}
                className="w-full px-4 py-2.5 bg-muted/50 border-2 border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
              >
                <option value="low-stock">Estoque Baixo</option>
                <option value="movements">Movimentações</option>
                <option value="products-by-category">Produtos por Categoria</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Formato</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as 'json' | 'csv')}
                className="w-full px-4 py-2.5 bg-muted/50 border-2 border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
              </select>
            </div>
            {reportType === 'movements' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Data Inicial
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-muted/50 border-2 border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Data Final</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-muted/50 border-2 border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
                  />
                </div>
              </>
            )}
          </div>
          {data && (
            <div className="mt-4">
              <Button onClick={handleDownload}>
                <Download className="w-4 h-4" />
                Baixar Relatório ({format.toUpperCase()})
              </Button>
            </div>
          )}
        </Card>
      </motion.div>

      {renderReportData()}
    </Layout>
  )
}
