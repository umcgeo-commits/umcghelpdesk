import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import {
  Ticket,
  MessageSquare,
  Users,
  ShieldCheck,
  ArrowRight,
  Clock,
  CheckCircle2,
  Phone,
  Globe,
  Sparkles,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Ticket className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg tracking-tight">HelpDesk</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#recursos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Recursos
              </a>
              <a href="#como-funciona" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Como Funciona
              </a>
              <a href="#contato" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contato
              </a>
            </nav>
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <Button onClick={() => navigate("/dashboard")} size="sm">
                  Painel
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <>
                  <Button onClick={() => navigate("/auth")} variant="ghost" size="sm">
                    Entrar
                  </Button>
                  <Button onClick={() => navigate("/auth")} size="sm" className="hidden sm:flex">
                    Criar Conta
                  </Button>
                </>
              )}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 text-muted-foreground hover:text-foreground"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden border-t border-border/40 bg-background px-4 py-4"
          >
            <nav className="flex flex-col gap-3">
              <a href="#recursos" className="text-sm text-muted-foreground hover:text-foreground" onClick={() => setMobileOpen(false)}>Recursos</a>
              <a href="#como-funciona" className="text-sm text-muted-foreground hover:text-foreground" onClick={() => setMobileOpen(false)}>Como Funciona</a>
              <a href="#contato" className="text-sm text-muted-foreground hover:text-foreground" onClick={() => setMobileOpen(false)}>Contato</a>
            </nav>
          </motion.div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="initial"
            animate="animate"
            variants={stagger}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.div variants={fadeUp} className="mb-6">
              <Badge variant="secondary" className="px-4 py-1.5 text-xs font-medium">
                <Sparkles className="w-3 h-3 mr-1.5 inline" />
                Sistema de Atendimento Inteligente
              </Badge>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]"
            >
              Suporte Técnico
              <span className="block text-primary mt-2">Simplificado</span>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="text-lg text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed"
            >
              Sistema completo de abertura e gerenciamento de chamados de suporte.
              Atendimento via portal web ou WhatsApp com acompanhamento em tempo real.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-4">
              {isAuthenticated ? (
                <Button onClick={() => navigate("/dashboard")} size="lg" className="h-12 px-8 text-base gap-2">
                  Ir para o Painel
                  <ArrowRight className="w-5 h-5" />
                </Button>
              ) : (
                <>
                  <Button onClick={() => navigate("/auth")} size="lg" className="h-12 px-8 text-base gap-2">
                    Abrir Chamado
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                  <Button
                    onClick={() => navigate("/auth")}
                    variant="outline"
                    size="lg"
                    className="h-12 px-8 text-base"
                  >
                    Acompanhar Chamado
                  </Button>
                </>
              )}
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto"
          >
            {[
              { label: "Chamados Resolvidos", value: "10.000+", icon: CheckCircle2 },
              { label: "Clientes Atendidos", value: "2.500+", icon: Users },
              { label: "Tempo Médio", value: "< 2h", icon: Clock },
              { label: "Disponibilidade", value: "24/7", icon: Globe },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-4 rounded-xl bg-card border border-border/50">
                <stat.icon className="w-5 h-5 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="recursos" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Tudo que você precisa
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Ferramentas completas para gerenciar o suporte da sua empresa com eficiência.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Ticket,
                title: "Portal de Chamados",
                description: "Abra e acompanhe chamados diretamente pelo site. Acompanhe o status em tempo real.",
                color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
              },
              {
                icon: Phone,
                title: "Atendimento via WhatsApp",
                description: "Receba notificações e responda chamados diretamente pelo WhatsApp com Evolution API.",
                color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400",
              },
              {
                icon: MessageSquare,
                title: "Chat em Tempo Real",
                description: "Comunicação direta com a equipe de suporte através do chat integrado nos chamados.",
                color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400",
              },
              {
                icon: ShieldCheck,
                title: "Gestão de Agentes",
                description: "Painel administrativo completo com atribuição de chamados e controle de prioridades.",
                color: "text-rose-600 bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400",
              },
              {
                icon: Clock,
                title: "Acompanhamento em Tempo Real",
                description: "Acompanhe cada atualização do seu chamado com notificações instantâneas.",
                color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400",
              },
              {
                icon: Users,
                title: "Múltiplos Atendentes",
                description: "Equipe de suporte com distribuição inteligente de chamados e filas de atendimento.",
                color: "text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30 dark:text-cyan-400",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="group relative p-6 rounded-2xl bg-card border border-border/50 hover:border-border hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${feature.color}`}>
                  <feature.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="como-funciona" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Como Funciona
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Em apenas alguns passos você abre e acompanha seu chamado.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "01", title: "Abra seu Chamado", desc: "Descreva seu problema no formulário online. Escolha a categoria e prioridade." },
              { step: "02", title: "Acompanhe o Status", desc: "Receba atualizações em tempo real. Atendimento via site ou WhatsApp." },
              { step: "03", title: "Resolução Garantida", desc: "Nossa equipe resolve seu problema e você recebe a confirmação." },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <span className="text-2xl font-bold text-primary">{item.step}</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[calc(80%)] h-px border-t-2 border-dashed border-border" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contato" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-8 sm:p-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Pronto para Começar?
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              Abra seu primeiro chamado agora e tenha suporte rápido e eficiente para suas necessidades.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {isAuthenticated ? (
                <Button onClick={() => navigate("/dashboard")} size="lg" className="h-12 px-8 text-base">
                  Ir para o Painel
                </Button>
              ) : (
                <Button onClick={() => navigate("/auth")} size="lg" className="h-12 px-8 text-base">
                  Abrir Chamado Gratuito
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <Ticket className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="text-sm font-medium">HelpDesk</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2026 HelpDesk. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
