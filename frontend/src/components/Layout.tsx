import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
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
  Sparkles
} from 'lucide-react'
import { useState } from 'react'

export function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const isAdmin = user.role === 'ADMIN'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const isActive = (path: string) => location.pathname === path

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'from-purple-500 to-purple-600' },
    { path: '/products', label: 'Produtos', icon: Package, color: 'from-blue-500 to-blue-600' },
    { path: '/categories', label: 'Categorias', icon: Tag, color: 'from-green-500 to-green-600' },
    { path: '/suppliers', label: 'Fornecedores', icon: Building2, color: 'from-orange-500 to-orange-600' },
    { path: '/movements', label: 'Movimentações', icon: Move, color: 'from-cyan-500 to-cyan-600' },
    { path: '/alerts', label: 'Alertas', icon: Bell, color: 'from-red-500 to-red-600' },
    { path: '/reports', label: 'Relatórios', icon: BarChart3, color: 'from-pink-500 to-pink-600' },
    ...(isAdmin ? [{ path: '/users', label: 'Usuários', icon: Users, color: 'from-indigo-500 to-indigo-600' }] : []),
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex">
      {/* Desktop Sidebar */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="hidden md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-30"
      >
        <div className="flex-1 flex flex-col min-h-0 glass border-r border-white/20">
          {/* Logo */}
          <div className="flex items-center justify-center px-6 py-6 border-b border-white/10">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 shadow-lg mr-3"
            >
              <Sparkles className="w-6 h-6 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold gradient-text">StockMaster</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navItems.map((item, index) => {
              const Icon = item.icon
              const active = isActive(item.path)
              return (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={item.path}
                    className={`group relative flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${
                      active
                        ? 'bg-gradient-to-r text-white shadow-lg'
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    } ${active ? item.color : ''}`}
                  >
                    {active && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r rounded-xl"
                        style={{
                          background: `linear-gradient(to right, var(--tw-gradient-stops))`,
                        }}
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                    <Icon className={`w-5 h-5 mr-3 relative z-10 ${active ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                    <span className="relative z-10">{item.label}</span>
                  </Link>
                </motion.div>
              )
            })}
          </nav>

          {/* User Profile */}
          <div className="flex-shrink-0 border-t border-white/10 p-4">
            <div className="glass-strong rounded-xl p-4 mb-3">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{user.name || 'Usuário'}</p>
                  <p className="text-xs text-gray-400">{user.role || 'OPERATOR'}</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-gradient-to-r from-red-500 to-red-600 rounded-lg text-white text-sm font-medium shadow-lg hover:shadow-red-500/50 transition-all duration-300"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg glass hover:bg-white/10 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-white" />
              ) : (
                <Menu className="w-6 h-6 text-white" />
              )}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-bold gradient-text">StockMaster</h1>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleLogout}
            className="p-2 rounded-lg glass hover:bg-red-500/20 transition-colors"
          >
            <LogOut className="w-5 h-5 text-white" />
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden fixed inset-y-0 left-0 w-72 z-40 glass border-r border-white/10 pt-16"
          >
            <nav className="px-4 py-6 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.path)
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${
                      active
                        ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="md:pl-72 flex flex-col flex-1 min-h-screen pt-16 md:pt-0">
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex-1 relative"
        >
          <div className="py-6 px-4 sm:px-6 md:px-8">
            <Outlet />
          </div>
        </motion.main>
      </div>
    </div>
  )
}
