'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Package,
  Tag,
  Building2,
  Move,
  Bell,
  BarChart3,
  Users,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { useState, useEffect } from 'react'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      const userData = localStorage.getItem('user')
      
      if (!token && pathname !== '/login') {
        router.push('/login')
        return
      }
      
      if (userData) {
        setUser(JSON.parse(userData))
      }
    }
  }, [pathname, router])

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push('/login')
    }
  }

  const isActive = (path: string) => pathname === path
  const isAdmin = user?.role === 'ADMIN'

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/products', label: 'Produtos', icon: Package },
    { path: '/categories', label: 'Categorias', icon: Tag },
    { path: '/suppliers', label: 'Fornecedores', icon: Building2 },
    { path: '/movements', label: 'Movimentações', icon: Move },
    { path: '/alerts', label: 'Alertas', icon: Bell },
    { path: '/reports', label: 'Relatórios', icon: BarChart3 },
    ...(isAdmin ? [{ path: '/users', label: 'Usuários', icon: Users }] : []),
  ]

  return (
    <div className="min-h-screen bg-background flex relative">
      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0 bg-grid-pattern opacity-20" />
      <motion.div
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="pointer-events-none fixed -top-40 -right-40 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl dark:bg-purple-500/20"
      />
      <motion.div
        animate={{
          x: [0, -50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="pointer-events-none fixed top-1/2 -left-40 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl dark:bg-cyan-500/20"
      />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-card border-r border-border backdrop-blur-sm z-30">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3 px-6 py-5 border-b border-border"
        >
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-purple-500/25"
          >
            <Package className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h1 className="text-lg font-bold text-gradient">StockMaster</h1>
            <p className="text-xs text-muted-foreground">Painel de Controle</p>
          </div>
        </motion.div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="space-y-1">
            {navItems.map((item, index) => {
              const Icon = item.icon
              const active = isActive(item.path)
              return (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Link
                    href={item.path}
                    className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      active
                        ? 'bg-gradient-to-r from-purple-500/10 to-cyan-500/10 text-purple-600 dark:text-purple-400 shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${active ? 'text-purple-600 dark:text-purple-400' : ''}`} />
                    <span className="flex-1">{item.label}</span>
                    {active && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute right-2 w-1.5 h-1.5 rounded-full bg-purple-600 dark:bg-purple-400"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </nav>

        {/* User Profile */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="border-t border-border p-4"
        >
          <div className="flex items-center gap-3 mb-3">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-purple-500/25"
            >
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </motion.div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {user?.name || 'Usuário'}
              </p>
              <p className="text-xs text-muted-foreground">{user?.role || 'OPERATOR'}</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </motion.button>
        </motion.div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-foreground" />
              ) : (
                <Menu className="w-6 h-6 text-foreground" />
              )}
            </motion.button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
                <Package className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-bold text-gradient">StockMaster</h1>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <LogOut className="w-5 h-5 text-foreground" />
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-slate-900/50 z-40"
            />
            <motion.aside
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="md:hidden fixed inset-y-0 left-0 w-64 bg-card/95 backdrop-blur-md border-r border-border z-50 pt-16"
            >
              <nav className="px-3 py-4 space-y-1">
                {navItems.map((item, index) => {
                  const Icon = item.icon
                  const active = isActive(item.path)
                  return (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                          active
                            ? 'bg-gradient-to-r from-purple-500/10 to-cyan-500/10 text-purple-600 dark:text-purple-400'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </Link>
                    </motion.div>
                  )
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="md:pl-64 flex-1 flex flex-col min-h-screen pt-16 md:pt-0 relative">
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full space-y-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
