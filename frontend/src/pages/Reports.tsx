import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'

export function Reports() {
  const [reportType, setReportType] = useState<'low-stock' | 'movements' | 'products-by-category'>('low-stock')
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
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">Carregando relatório...</div>
        </div>
      )
    }

    if (!data) {
      return (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <p className="text-gray-500">Selecione um tipo de relatório</p>
        </div>
      )
    }

    if (format === 'csv') {
      return (
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-sm text-gray-600 mb-4">
            Relatório gerado. Clique em "Baixar" para fazer o download.
          </p>
          <button
            onClick={handleDownload}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Baixar CSV
          </button>
        </div>
      )
    }

    // JSON format
    if (reportType === 'low-stock') {
      return (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {data.data?.map((product: any) => (
              <li key={product.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {product.name}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {product.category?.name} | {product.supplier?.name}
                    </p>
                    <p className="text-sm text-red-600 mt-1">
                      Estoque: {product.currentStock} {product.unit} | 
                      Mínimo: {product.minimumStock} {product.unit}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      R$ {product.salePrice?.toFixed(2)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )
    }

    if (reportType === 'movements') {
      return (
        <div className="space-y-6">
          {data.summary && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Resumo</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Total de Movimentações</p>
                  <p className="text-2xl font-bold text-gray-900">{data.summary.total}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Entradas</p>
                  <p className="text-2xl font-bold text-green-600">{data.summary.entries || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Saídas</p>
                  <p className="text-2xl font-bold text-red-600">{data.summary.exits || 0}</p>
                </div>
              </div>
            </div>
          )}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {data.data?.map((movement: any) => (
                <li key={movement.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {movement.product?.name}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {movement.type} - {movement.reason} | 
                        Quantidade: {movement.quantity}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(movement.createdAt).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )
    }

    if (reportType === 'products-by-category') {
      return (
        <div className="space-y-6">
          {data.data?.map((category: any) => (
            <div key={category.id} className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {category.name}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Total de produtos: {category.totalProducts} | 
                Valor total: R$ {category.totalValue?.toFixed(2)}
              </p>
              <ul className="divide-y divide-gray-200">
                {category.products?.map((product: any) => (
                  <li key={product.id} className="py-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {product.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Estoque: {product.currentStock} {product.unit}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        R$ {product.salePrice?.toFixed(2)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )
    }

    return null
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Relatórios</h1>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Relatório
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="low-stock">Estoque Baixo</option>
              <option value="movements">Movimentações</option>
              <option value="products-by-category">Produtos por Categoria</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Formato
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as 'json' | 'csv')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
            </select>
          </div>
          {reportType === 'movements' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Inicial
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
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
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </>
          )}
        </div>
        {data && (
          <div className="mt-4">
            <button
              onClick={handleDownload}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Baixar Relatório ({format.toUpperCase()})
            </button>
          </div>
        )}
      </div>

      {renderReportData()}
    </div>
  )
}
