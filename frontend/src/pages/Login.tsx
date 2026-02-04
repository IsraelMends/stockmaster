import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Mail, Lock, Eye, EyeOff, Boxes, BarChart3, Zap, Shield, AlertCircle } from 'lucide-react'
import api from '../lib/api'

export function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [focused, setFocused] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await api.post('/auth/login', data)
      return response.data
    },
    onSuccess: (data) => {
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      navigate('/dashboard')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loginMutation.mutate({ email, password })
  }

  const stats = [
    { value: '99.9%', label: 'Uptime garantido' },
    { value: '50k+', label: 'Produtos gerenciados' },
    { value: '2.5x', label: 'Mais eficiencia' },
  ]

  const features = [
    { icon: Boxes, title: 'Gestao Inteligente', desc: 'Controle total do inventario' },
    { icon: BarChart3, title: 'Analytics Avancado', desc: 'Insights em tempo real' },
    { icon: Zap, title: 'Automacao', desc: 'Processos otimizados' },
    { icon: Shield, title: 'Seguranca', desc: 'Dados protegidos' },
  ]

  return (
    <div className="min-h-screen flex bg-[#0a0a0a]">
      {/* Left Side - Premium Branding */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-[#0a0a0a]">
        {/* Subtle Grid */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '64px 64px'
          }}
        />

        {/* Gradient Orbs */}
        <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full w-full p-12 xl:p-16">
          {/* Logo */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <Boxes className="w-6 h-6 text-[#0a0a0a]" />
            </div>
            <span className="text-white text-xl font-semibold tracking-tight">StockMaster</span>
          </motion.div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col justify-center max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
            >
              <h1 className="text-5xl xl:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-6">
                A plataforma completa para{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                  gestao de estoque
                </span>
              </h1>
              <p className="text-lg text-neutral-400 leading-relaxed max-w-md">
                Simplifique operacoes, reduza custos e tome decisoes mais inteligentes com dados em tempo real.
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex gap-12 mt-12 pt-12 border-t border-neutral-800"
            >
              {stats.map((stat, i) => (
                <div key={i}>
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-neutral-500">{stat.label}</div>
                </div>
              ))}
            </motion.div>

            {/* Feature Cards */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="grid grid-cols-2 gap-3 mt-12"
            >
              {features.map((feature, i) => {
                const Icon = feature.icon
                return (
                  <div 
                    key={i}
                    className="group p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800/50 hover:border-neutral-700 hover:bg-neutral-900 transition-all duration-300"
                  >
                    <div className="w-9 h-9 rounded-xl bg-neutral-800 flex items-center justify-center mb-3 group-hover:bg-emerald-500/10 transition-colors">
                      <Icon className="w-4.5 h-4.5 text-neutral-400 group-hover:text-emerald-400 transition-colors" />
                    </div>
                    <div className="text-sm font-medium text-white mb-0.5">{feature.title}</div>
                    <div className="text-xs text-neutral-500">{feature.desc}</div>
                  </div>
                )
              })}
            </motion.div>
          </div>

          {/* Bottom Text */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xs text-neutral-600"
          >
            Utilizado por mais de 500 empresas em todo o Brasil
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-[45%] flex items-center justify-center px-6 sm:px-12 bg-[#fafafa] relative">
        {/* Subtle Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.03) 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}
        />

        <div className="w-full max-w-[400px] relative z-10">
          {/* Mobile Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-12 lg:hidden"
          >
            <div className="w-10 h-10 bg-[#0a0a0a] rounded-xl flex items-center justify-center">
              <Boxes className="w-6 h-6 text-white" />
            </div>
            <span className="text-[#0a0a0a] text-xl font-semibold tracking-tight">StockMaster</span>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <h2 className="text-3xl font-bold text-[#0a0a0a] tracking-tight mb-2">
              Bem-vindo de volta
            </h2>
            <p className="text-neutral-500">
              Entre na sua conta para continuar
            </p>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">
                Email
              </label>
              <div className="relative">
                <div className={`absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center pointer-events-none transition-colors ${
                  focused === 'email' ? 'text-[#0a0a0a]' : 'text-neutral-400'
                }`}>
                  <Mail className="w-[18px] h-[18px]" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  placeholder="nome@empresa.com"
                  className={`w-full h-12 pl-12 pr-4 bg-white border-2 rounded-xl text-[#0a0a0a] placeholder-neutral-400 outline-none transition-all duration-200 ${
                    focused === 'email'
                      ? 'border-[#0a0a0a] shadow-[0_0_0_4px_rgba(0,0,0,0.05)]'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">
                Senha
              </label>
              <div className="relative">
                <div className={`absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center pointer-events-none transition-colors ${
                  focused === 'password' ? 'text-[#0a0a0a]' : 'text-neutral-400'
                }`}>
                  <Lock className="w-[18px] h-[18px]" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  placeholder="Digite sua senha"
                  className={`w-full h-12 pl-12 pr-12 bg-white border-2 rounded-xl text-[#0a0a0a] placeholder-neutral-400 outline-none transition-all duration-200 ${
                    focused === 'password'
                      ? 'border-[#0a0a0a] shadow-[0_0_0_4px_rgba(0,0,0,0.05)]'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 bottom-0 w-12 flex items-center justify-center text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <button type="button" className="text-sm text-neutral-500 hover:text-[#0a0a0a] transition-colors">
                Esqueceu a senha?
              </button>
            </div>

            {/* Error */}
            <AnimatePresence>
              {loginMutation.isError && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl"
                >
                  <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-900">Credenciais invalidas</p>
                    <p className="text-xs text-red-600">Verifique seu email e senha</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loginMutation.isPending}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full h-12 bg-[#0a0a0a] hover:bg-[#171717] text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loginMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Entrando...</span>
                </>
              ) : (
                <>
                  <span>Entrar</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </motion.button>
          </motion.form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-[#fafafa] text-xs text-neutral-400 uppercase tracking-wider">
                ou continue com
              </span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-3">
            <button 
              type="button"
              className="h-11 bg-white border-2 border-neutral-200 hover:border-neutral-300 rounded-xl flex items-center justify-center gap-2 text-sm font-medium text-neutral-700 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            <button 
              type="button"
              className="h-11 bg-white border-2 border-neutral-200 hover:border-neutral-300 rounded-xl flex items-center justify-center gap-2 text-sm font-medium text-neutral-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </button>
          </div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-10 text-center text-xs text-neutral-400"
          >
            2024 StockMaster. Todos os direitos reservados.
          </motion.p>
        </div>
      </div>
    </div>
  )
}
