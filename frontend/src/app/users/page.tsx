'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Edit2, Trash2, Users as UsersIcon, Loader2 } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { Layout } from '@/components/layout/Layout'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

interface User {
  id: number
  name: string
  email: string
  role: 'ADMIN' | 'OPERATOR'
  active: boolean
}

export default function UsersPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/users')
      return response.data.data || []
    },
  })

  const userMutation = useMutation({
    mutationFn: async (userData: Partial<User & { password?: string }>) => {
      // Se estiver editando, usamos a rota protegida de usuários
      if (editingUser) {
        return api.put(`/users/${editingUser.id}`, userData)
      }
      // Para criar um novo usuário usamos o fluxo de registro
      // do backend: POST /auth/register
      return api.post('/auth/register', userData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setIsModalOpen(false)
      setEditingUser(null)
      toast.success(editingUser ? 'Usuário atualizado!' : 'Usuário criado!')
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        'Erro ao salvar usuário.'
      toast.error(message)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.delete(`/users/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('Usuário desativado!')
    },
    onError: () => {
      toast.error('Erro ao desativar usuário.')
    },
  })

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja desativar este usuário?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const isEditing = !!editingUser

    const userData: any = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      role: formData.get('role') as User['role'],
    }

    // Campo active só existe quando estamos editando
    if (isEditing) {
      userData.active = formData.get('active') === 'true'
    }

    if (!editingUser || formData.get('password')) {
      userData.password = formData.get('password') as string
    }
    userMutation.mutate(userData)
  }

  return (
    <Layout>
      <PageHeader
        title="Usuários"
        description="Controle os perfis de acesso ao sistema"
        actions={
          <Button
            onClick={() => {
              setEditingUser(null)
              setIsModalOpen(true)
            }}
          >
            <Plus className="w-5 h-5" />
            Novo Usuário
          </Button>
        }
      />

      {isLoading ? (
        <Card className="p-8 flex items-center justify-center">
          <div className="text-muted-foreground">Carregando usuários...</div>
        </Card>
      ) : data?.length === 0 ? (
        <Card className="p-12 text-center">
          <UsersIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhum usuário encontrado</p>
        </Card>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="overflow-hidden">
            <div className="divide-y divide-border">
              {data?.map((user: User, index: number) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={{ x: 4 }}
                  className="px-6 py-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-foreground">{user.name}</p>
                        {!user.active && <Badge variant="danger">Inativo</Badge>}
                        <Badge variant={user.role === 'ADMIN' ? 'info' : 'default'}>
                          {user.role === 'ADMIN' ? 'Administrador' : 'Operador'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEdit(user)}
                        className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(user.id)}
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
                setEditingUser(null)
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
                      {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
                    </h3>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setIsModalOpen(false)
                        setEditingUser(null)
                      }}
                      className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  </div>

                  <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Nome *</label>
                      <input
                        type="text"
                        name="name"
                        required
                        defaultValue={editingUser?.name}
                        className="w-full px-4 py-2.5 bg-muted/50 border-2 border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Email *</label>
                      <input
                        type="email"
                        name="email"
                        required
                        defaultValue={editingUser?.email}
                        className="w-full px-4 py-2.5 bg-muted/50 border-2 border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        {editingUser ? 'Nova Senha (deixe em branco para manter)' : 'Senha *'}
                      </label>
                      <input
                        type="password"
                        name="password"
                        required={!editingUser}
                        minLength={6}
                        className="w-full px-4 py-2.5 bg-muted/50 border-2 border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Perfil *</label>
                      <select
                        name="role"
                        required
                        defaultValue={editingUser?.role || 'OPERATOR'}
                        className="w-full px-4 py-2.5 bg-muted/50 border-2 border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
                      >
                        <option value="OPERATOR">Operador</option>
                        <option value="ADMIN">Administrador</option>
                      </select>
                    </div>
                    {editingUser && (
                      <div>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            name="active"
                            value="true"
                            defaultChecked={editingUser.active}
                            className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                          />
                          <span className="text-sm text-foreground">Ativo</span>
                        </label>
                      </div>
                    )}
                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          setIsModalOpen(false)
                          setEditingUser(null)
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={userMutation.isPending}>
                        {userMutation.isPending ? (
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
