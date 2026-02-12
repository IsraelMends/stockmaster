'use client'

import Link from 'next/link'
import {
  Package,
  BarChart3,
  Shield,
  Zap,
  ArrowRight,
  TrendingUp,
  Users,
  Bell,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { clear } from 'console'

const features = [
  {
    icon: Package,
    title: 'Gestão Completa',
    description: 'Controle total sobre seu inventário com CRUD completo de produtos',
  },
  {
    icon: BarChart3,
    title: 'Dashboard Inteligente',
    description: 'Visualize estatísticas e gráficos em tempo real do seu estoque',
  },
  {
    icon: Bell,
    title: 'Alertas Automáticos',
    description: 'Receba notificações quando produtos estiverem com estoque baixo',
  },
  {
    icon: TrendingUp,
    title: 'Relatórios Avançados',
    description: 'Gere relatórios detalhados em JSON ou CSV para análise',
  },
  {
    icon: Users,
    title: 'Controle de Acesso',
    description: 'Sistema de permissões com roles de Admin e Operador',
  },
  {
    icon: Shield,
    title: 'Segurança Total',
    description: 'Autenticação JWT e proteção de rotas para seus dados',
  },
]

const stats = [
  { label: 'Produtos Gerenciados', value: '1000+' },
  { label: 'Movimentações Diárias', value: '500+' },
  { label: 'Usuários Ativos', value: '50+' },
  { label: 'Uptime', value: '99.9%' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects - simplificados */}
      <div className="pointer-events-none fixed inset-0 bg-grid-pattern opacity-10" />
      <div className="pointer-events-none fixed -top-40 -right-40 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl" />
      <div className="pointer-events-none fixed bottom-0 left-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="text-center">
          {/* Logo */}
          <div className="inline-flex items-center justify-center mb-8">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center shadow-2xl shadow-purple-500/50">
              <Package className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="text-gradient">StockMaster</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-3xl mx-auto">
            Sistema profissional de gestão de estoque
          </p>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            Controle total sobre seu inventário, movimentações e relatórios com uma interface moderna
            e intuitiva
          </p>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login" prefetch>
              <Button className="group text-lg px-8 py-6">
                <span>Acessar Plataforma</span>
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <button
              onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="px-8 py-6 text-lg font-semibold text-foreground hover:text-primary transition-colors"
            >
              Saiba Mais
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gradient mb-2">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient">Recursos Poderosos</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Tudo que você precisa para gerenciar seu estoque de forma profissional
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="card-elevated p-8 rounded-2xl group cursor-pointer hover:-translate-y-1 transition-transform duration-200"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="card-elevated p-12 md:p-16 rounded-3xl text-center border-2 border-primary/20 bg-gradient-to-br from-purple-500/5 to-cyan-500/5">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-purple-500/50">
              <Zap className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-gradient">Pronto para começar?</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Acesse a plataforma e comece a gerenciar seu estoque de forma profissional hoje mesmo
          </p>
          <Link href="/login" prefetch>
            <Button className="text-lg px-8 py-6 group">
              <span>Acessar Plataforma</span>
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient">StockMaster</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} StockMaster. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
