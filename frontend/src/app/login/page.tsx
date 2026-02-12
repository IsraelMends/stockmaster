'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { LogIn, Mail, Lock, Package, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import api from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

const TERMINAL_LINES = [
  "const stockMaster = {",
  "  name: 'StockMaster',",
  "  version: '2.0.0',",
  "  features: ['CRUD', 'Dashboard', 'Reports'],",
  "  auth: { type: 'JWT', secure: true }",
  "};",
  "",
  "console.log('Welcome to StockMaster 🚀');",
]

interface ValidationState {
  isValid: boolean
  message: string
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [focused, setFocused] = useState<string | null>(null)
  const [emailValidation, setEmailValidation] = useState<ValidationState | null>(null)
  const [passwordValidation, setPasswordValidation] = useState<ValidationState | null>(null)
  const [displayedLines, setDisplayedLines] = useState<string[]>([])
  const [showCursor, setShowCursor] = useState(true)

  // Terminal animation - otimizada (mostra todas as linhas de uma vez)
  useEffect(() => {
    if (displayedLines.length === 0) {
      const timeout = setTimeout(() => {
        setDisplayedLines(TERMINAL_LINES)
      }, 300)
      return () => clearTimeout(timeout)
    }
  }, [displayedLines.length])

  useEffect(() => {
    const interval = setInterval(() => setShowCursor((c) => !c), 530)
    return () => clearInterval(interval)
  }, [])

  // Email validation
  useEffect(() => {
    if (!email) {
      setEmailValidation(null)
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const isValid = emailRegex.test(email)
    setEmailValidation({
      isValid,
      message: isValid ? 'Email válido' : 'Formato de email inválido',
    })
  }, [email])

  // Password validation
  useEffect(() => {
    if (!password) {
      setPasswordValidation(null)
      return
    }

    const isValid = password.length >= 6
    setPasswordValidation({
      isValid,
      message: isValid ? 'Senha válida' : 'Mínimo de 6 caracteres',
    })
  }, [password])

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await api.post('/auth/login', data)
      return response.data
    },
    onSuccess: (data) => {
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      router.push('/dashboard')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (emailValidation?.isValid && passwordValidation?.isValid) {
      loginMutation.mutate({ email, password })
    }
  }

  const isFormValid = emailValidation?.isValid && passwordValidation?.isValid

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background effects */}
      <div className="pointer-events-none fixed inset-0 bg-grid-pattern opacity-20" />
      <motion.div
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="pointer-events-none fixed -top-40 -right-40 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl dark:bg-purple-500/20"
      />
      <motion.div
        animate={{
          x: [0, -100, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="pointer-events-none fixed top-1/2 -left-40 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl dark:bg-cyan-500/20"
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="pointer-events-none fixed bottom-0 right-1/4 h-96 w-96 rounded-full bg-purple-500/5 blur-3xl"
      />

      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left: Terminal */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:block order-2 lg:order-1"
          >
            <div className="overflow-hidden rounded-2xl border border-border bg-slate-100/50 dark:bg-slate-950/90 shadow-2xl backdrop-blur-sm">
              {/* Terminal header */}
              <div className="flex items-center gap-2 border-b border-border bg-slate-200/80 dark:bg-white/5 px-4 py-3">
                <div className="flex gap-1.5">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="h-2.5 w-2.5 rounded-full bg-red-500/80"
                  />
                  <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
                </div>
                <span className="font-mono text-xs text-muted-foreground">terminal — stockmaster</span>
              </div>
              {/* Terminal content */}
              <div className="p-6 font-mono text-sm text-foreground min-h-[280px]">
                {displayedLines.map((line, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="flex"
                  >
                    <span className="select-none pr-3 text-primary">→</span>
                    <span className="text-slate-800 dark:text-slate-100">
                      {line}
                      {i === displayedLines.length - 1 && showCursor && (
                        <motion.span
                          animate={{ opacity: [1, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                          className="text-primary"
                        >
                          |
                        </motion.span>
                      )}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Branding below terminal */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-8"
            >
              <motion.div
                whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.3 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-cyan-600 mb-6 shadow-xl shadow-purple-500/25"
              >
                <Package className="w-8 h-8 text-white" />
              </motion.div>
              <h1 className="text-5xl font-bold mb-4">
                <span className="text-gradient">StockMaster</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-md leading-relaxed">
                Sistema profissional de gestão de estoque. Controle total sobre inventário, movimentações e relatórios em tempo real.
              </p>
            </motion.div>
          </motion.div>

          {/* Right: Login Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-md mx-auto order-1 lg:order-2"
          >
            {/* Mobile logo */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8 lg:hidden"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-cyan-600 mb-3 shadow-lg shadow-purple-500/25"
              >
                <Package className="w-7 h-7 text-white" />
              </motion.div>
              <h1 className="text-3xl font-bold mb-2">
                <span className="text-gradient">StockMaster</span>
              </h1>
              <p className="text-sm text-muted-foreground">Sistema de Controle de Estoque</p>
            </motion.div>

            {/* Form Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="p-8 backdrop-blur-md border-2 border-border/50">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mb-6"
                >
                  <h2 className="text-2xl font-bold text-foreground mb-2">Bem-vindo de volta</h2>
                  <p className="text-sm text-muted-foreground">Entre com suas credenciais para continuar</p>
                </motion.div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Field */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <motion.div
                        animate={{
                          scale: focused === 'email' ? 1.1 : 1,
                        }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none"
                      >
                        <Mail className={`w-5 h-5 transition-colors duration-200 ${
                          focused === 'email' ? 'text-primary' : 'text-muted-foreground'
                        }`} />
                      </motion.div>
                      <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocused('email')}
                        onBlur={() => setFocused(null)}
                        className={`w-full pl-12 pr-12 py-3.5  border-2 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none transition-all duration-300 text-sm ${
                          focused === 'email'
                            ? 'border-primary shadow-lg shadow-primary/20'
                            : emailValidation
                            ? emailValidation.isValid
                              ? 'border-emerald-500/50'
                              : 'border-red-500/50'
                            : 'border-border'
                        }`}
                        placeholder="seu@email.com"
                      />
                      <AnimatePresence>
                        {emailValidation && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="absolute right-4 top-1/2 -translate-y-1/2"
                          >
                            {emailValidation.isValid ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-red-500" />
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <AnimatePresence>
                      {emailValidation && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className={`mt-2 text-xs font-medium ${
                            emailValidation.isValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          {emailValidation.message}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Password Field */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <label htmlFor="password" className="block text-sm font-semibold text-foreground mb-2">
                      Senha
                    </label>
                    <div className="relative">
                      <motion.div
                        animate={{
                          scale: focused === 'password' ? 1.1 : 1,
                        }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none"
                      >
                        <Lock className={`w-5 h-5 transition-colors duration-200 ${
                          focused === 'password' ? 'text-primary' : 'text-muted-foreground'
                        }`} />
                      </motion.div>
                      <input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setFocused('password')}
                        onBlur={() => setFocused(null)}
                        className={`w-full pl-12 pr-12 py-3.5  border-2 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none transition-all duration-300 text-sm ${
                          focused === 'password'
                            ? 'border-primary shadow-lg shadow-primary/20'
                            : passwordValidation
                            ? passwordValidation.isValid
                              ? 'border-emerald-500/50'
                              : 'border-red-500/50'
                            : 'border-border'
                        }`}
                        placeholder="••••••••"
                      />
                      <AnimatePresence>
                        {passwordValidation && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="absolute right-4 top-1/2 -translate-y-1/2"
                          >
                            {passwordValidation.isValid ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-red-500" />
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <AnimatePresence>
                      {passwordValidation && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className={`mt-2 text-xs font-medium ${
                            passwordValidation.isValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          {passwordValidation.message}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Error Message */}
                  <AnimatePresence>
                    {loginMutation.isError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="rounded-xl bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 p-4 flex items-center gap-3"
                      >
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                        <p className="text-sm font-medium text-red-800 dark:text-red-300">
                          Credenciais inválidas. Verifique seu email e senha.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={loginMutation.isPending || !isFormValid}
                    whileHover={isFormValid && !loginMutation.isPending ? { scale: 1.02, y: -2 } : {}}
                    whileTap={isFormValid && !loginMutation.isPending ? { scale: 0.98 } : {}}
                    className={`w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-300 flex items-center justify-center gap-3 text-sm ${
                      isFormValid && !loginMutation.isPending
                        ? 'hover:shadow-xl hover:shadow-purple-500/40 cursor-pointer'
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Autenticando...</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-5 h-5" />
                        <span>Entrar</span>
                      </>
                    )}
                  </motion.button>
                </form>
              </Card>
            </motion.div>

            {/* Footer */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-6 text-center text-xs text-muted-foreground"
            >
              © 2024 StockMaster. Todos os direitos reservados.
            </motion.p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
