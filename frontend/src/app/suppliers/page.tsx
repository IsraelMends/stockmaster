'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, X, Edit2, Trash2, Building2, Loader2 } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { Layout } from '@/components/layout/Layout'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

interface Supplier {
  id: number
  name: string
  cnpj: string
  email?: string
  phone?: string
  address?: string
}

export default function SuppliersPage() {
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
      toast.success(editingSupplier ? 'Fornecedor atualizado!' : 'Fornecedor criado!')
    },
    onError: () => {
      toast.error('Erro ao salvar fornecedor.')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.delete(`/suppliers/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      toast.success('Fornecedor excluído!')
    },
    onError: () => {
      toast.error('Erro ao excluir fornecedor.')
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
      email: (formData.get('email') as string) || undefined,
      phone: (formData.get('phone') as string) || undefined,
      address: (formData.get('address') as string) || undefined,
    }
    supplierMutation.mutate(supplierData)
  }

  const formatCNPJ = (cnpj: string) => {
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
  }

  return (
    <Layout>
      <PageHeader
        title="Fornecedores"
        description="Gerencie seus parceiros e dados fiscais"
        actions={
          <Button
            onClick={() => {
              setEditingSupplier(null)
              setIsModalOpen(true)
            }}
          >
            <Plus className="w-5 h-5" />
            Novo Fornecedor
          </Button>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="p-4 sm:p-6">
          <div className="max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar fornecedor..."
                className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border-2 border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
              />
            </div>
          </div>
        </Card>
      </motion.div>

      {isLoading ? (
        <Card className="p-8 flex items-center justify-center">
          <div className="text-muted-foreground">Carregando fornecedores...</div>
        </Card>
      ) : data?.length === 0 ? (
        <Card className="p-12 text-center">
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhum fornecedor encontrado</p>
        </Card>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="overflow-hidden">
            <div className="divide-y divide-border">
              {data?.map((supplier: Supplier, index: number) => (
                <motion.div
                  key={supplier.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={{ x: 4 }}
                  className="px-6 py-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{supplier.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        CNPJ: {formatCNPJ(supplier.cnpj)}
                      </p>
                      {supplier.email && (
                        <p className="text-sm text-muted-foreground">{supplier.email}</p>
                      )}
                      {supplier.phone && (
                        <p className="text-sm text-muted-foreground">{supplier.phone}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEdit(supplier)}
                        className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(supplier.id)}
                        className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsModalOpen(false)
                setEditingSupplier(null)
              }}
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
                    <h3 className="text-xl font-bold text-foreground">
                      {editingSupplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}
                    </h3>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setIsModalOpen(false)
                        setEditingSupplier(null)
                      }}
                      className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  </div>

                  <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Nome *
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        defaultValue={editingSupplier?.name}
                        className="w-full px-4 py-2.5 bg-muted/50 border-2 border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        CNPJ * (14 dígitos)
                      </label>
                      <input
                        type="text"
                        name="cnpj"
                        required
                        maxLength={14}
                        pattern="[0-9]{14}"
                        defaultValue={editingSupplier?.cnpj}
                        className="w-full px-4 py-2.5 bg-muted/50 border-2 border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        defaultValue={editingSupplier?.email}
                        className="w-full px-4 py-2.5 bg-muted/50 border-2 border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Telefone
                      </label>
                      <input
                        type="text"
                        name="phone"
                        defaultValue={editingSupplier?.phone}
                        className="w-full px-4 py-2.5 bg-muted/50 border-2 border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Endereço
                      </label>
                      <textarea
                        name="address"
                        rows={3}
                        defaultValue={editingSupplier?.address}
                        className="w-full px-4 py-2.5 bg-muted/50 border-2 border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm resize-none"
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          setIsModalOpen(false)
                          setEditingSupplier(null)
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={supplierMutation.isPending}>
                        {supplierMutation.isPending ? (
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
