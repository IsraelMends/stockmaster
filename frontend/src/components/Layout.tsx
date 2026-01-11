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
  Sparkles,
  ChevronRight
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
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-500/10' },
    { path: '/products', label: 'Produtos', icon: Package, color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-500/10' },
    { path: '/categories', label: 'Categorias', icon: Tag, color: 'from-green-500 to-green-600', bgColor: 'bg-green-500/10' },
    { path: '/suppliers', label: 'Fornecedores', icon: Building2, color: 'from-orange-500 to-orange-600', bgColor: 'bg-orange-500/10' },
    { path: '/movements', label: 'Movimentações', icon: Move, color: 'from-cyan-500 to-cyan-600', bgColor: 'bg-cyan-500/10' },
    { path: '/alerts', label: 'Alertas', icon: Bell, color: 'from-red-500 to-red-600', bgColor: 'bg-red-500/10' },
    { path: '/reports', label: 'Relatórios', icon: BarChart3, color: 'from-pink-500 to-pink-600', bgColor: 'bg-pink-500/10' },
    ...(isAdmin ? [{ path: '/users', label: 'Usuários', icon: Users, color: 'from-indigo-500 to-indigo-600', bgColor: 'bg-indigo-500/10' }] : []),
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex relative">
      {/* Grid pattern overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none z-0"></div>

      {/* Desktop Sidebar */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="hidden md:flex md:w-80 md:flex-col md:fixed md:inset-y-0 z-30 relative"
      >
        <div className="flex-1 flex flex-col min-h-0 glass border-r border-white/10 backdrop-blur-2xl">
          {/* Logo Section */}
          <div className="flex items-center justify-center px-6 py-8 border-b border-white/10 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-cyan-500/10"></div>
            
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="relative inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 shadow-2xl shadow-purple-500/50 mr-4 group"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Sparkles className="w-7 h-7 text-white relative z-10" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                StockMaster
              </h1>
              <p className="text-xs text-gray-400">Painel de Controle</p>
            </div>
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
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <Link
                    to={item.path}
                    className={`group relative flex items-center justify-between px-4 py-3.5 text-sm font-semibold rounded-xl transition-all duration-300 overflow-hidden ${
                      active
                        ? `text-white shadow-xl shadow-purple-500/20`
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {/* Active background */}
                    {active && (
                      <motion.div
                        layoutId="activeTab"
                        className={`absolute inset-0 bg-gradient-to-r ${item.color} rounded-xl`}
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                      />
                    )}

                    {/* Hover background */}
                    {!active && (
                      <motion.div
                        className={`absolute inset-0 ${item.bgColor} rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                      />
                    )}

                    <div className="flex items-center relative z-10">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 transition-all duration-300 ${
                        active 
                          ? 'bg-white/20 shadow-lg' 
                          : 'bg-white/5 group-hover:bg-white/10'
                      }`}>
                        <Icon className={`w-5 h-5 transition-colors duration-300 ${active ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                      </div>
                      <span className="relative z-10">{item.label}</span>
                    </div>

                    {/* Arrow indicator */}
                    {active && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="relative z-10"
                      >
                        <ChevronRight className="w-5 h-5 text-white" />
                      </motion.div>
                    )}
                  </Link>
                </motion.div>
              )
            })}
          </nav>

          {/* User Profile Section */}
          <div className="flex-shrink-0 border-t border-white/10 p-4 relative">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-t from-purple-500/5 via-transparent to-transparent"></div>
            
            <div className="glass-strong rounded-2xl p-4 mb-3 relative backdrop-blur-xl">
              <div className="flex items-center mb-4">
                <div className="relative group">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/50 mr-3 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white font-bold text-lg">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-slate-950"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{user.name || 'Usuário'}</p>
                  <p className="text-xs text-gray-400 font-medium">{user.role || 'OPERATOR'}</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02, x: 2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-red-500 to-red-600 rounded-xl text-white text-sm font-bold shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all duration-300 group"
              >
                <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
                Sair
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 glass border-b border-white/10 backdrop-blur-2xl">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl glass hover:bg-white/10 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-white" />
              ) : (
                <Menu className="w-6 h-6 text-white" />
              )}
            </motion.button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                StockMaster
              </h1>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleLogout}
            className="p-2 rounded-xl glass hover:bg-red-500/20 transition-colors"
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
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden fixed inset-y-0 left-0 w-80 z-40 glass border-r border-white/10 backdrop-blur-2xl pt-16"
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
                    className={`flex items-center justify-between px-4 py-3.5 text-sm font-semibold rounded-xl transition-all duration-300 ${
                      active
                        ? `bg-gradient-to-r ${item.color} text-white shadow-xl`
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                        active ? 'bg-white/20' : 'bg-white/5'
                      }`}>
                        <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-400'}`} />
                      </div>
                      {item.label}
                    </div>
                    {active && <ChevronRight className="w-5 h-5 text-white" />}
                  </Link>
                )
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="md:pl-80 flex flex-col flex-1 min-h-screen pt-16 md:pt-0 relative z-10">
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
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
