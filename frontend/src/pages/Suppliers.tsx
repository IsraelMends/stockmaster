import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'

interface Supplier {
  id: number
  name: string
  cnpj: string
  email?: string
  phone?: string
  address?: string
}

export function Suppliers() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['suppliers', search],
    queryFn: async () => {
      const params = search ? `?search=${search}` : ''
      const response = await api.get(`/suppliers${params}`)
      return response.data.data || []
    },
  })

  const supplierMutation = useMutation({
    mutationFn: async (supplierData: Partial<Supplier>) => {
      if (editingSupplier) {
        return api.put(`/suppliers/${editingSupplier.id}`, supplierData)
      } else {
        return api.post('/suppliers', supplierData)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      setIsModalOpen(false)
      setEditingSupplier(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.delete(`/suppliers/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
    },
  })

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este fornecedor?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const supplierData = {
      name: formData.get('name') as string,
      cnpj: formData.get('cnpj') as string,
      email: formData.get('email') as string || undefined,
      phone: formData.get('phone') as string || undefined,
      address: formData.get('address') as string || undefined,
    }
    supplierMutation.mutate(supplierData)
  }

  const formatCNPJ = (cnpj: string) => {
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Fornecedores</h1>
        <button
          onClick={() => {
            setEditingSupplier(null)
            setIsModalOpen(true)
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Novo Fornecedor
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar fornecedor..."
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">Carregando fornecedores...</div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {data?.map((supplier: Supplier) => (
              <li key={supplier.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {supplier.name}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      CNPJ: {formatCNPJ(supplier.cnpj)}
                    </p>
                    {supplier.email && (
                      <p className="text-sm text-gray-500">{supplier.email}</p>
                    )}
                    {supplier.phone && (
                      <p className="text-sm text-gray-500">{supplier.phone}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(supplier)}
                      className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(supplier.id)}
                      className="text-red-600 hover:text-red-900 text-sm font-medium"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingSupplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}
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
                    defaultValue={editingSupplier?.name}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    CNPJ * (14 dígitos)
                  </label>
                  <input
                    type="text"
                    name="cnpj"
                    required
                    maxLength={14}
                    pattern="[0-9]{14}"
                    defaultValue={editingSupplier?.cnpj}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={editingSupplier?.email}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Telefone
                  </label>
                  <input
                    type="text"
                    name="phone"
                    defaultValue={editingSupplier?.phone}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Endereço
                  </label>
                  <textarea
                    name="address"
                    rows={3}
                    defaultValue={editingSupplier?.address}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false)
                      setEditingSupplier(null)
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={supplierMutation.isPending}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {supplierMutation.isPending ? 'Salvando...' : 'Salvar'}
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
