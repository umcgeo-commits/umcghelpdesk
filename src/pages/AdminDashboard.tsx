import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import {
  Ticket,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  TrendingUp,
  ArrowUpRight,
  List,
} from "lucide-react";
import { motion } from "framer-motion";

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const stats = useQuery(api.tickets.getTicketStats, {});
  const tickets = useQuery(api.tickets.listAllTickets, {});

  if (!stats) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-pulse text-muted-foreground">Carregando...</div>
        </div>
      </AppLayout>
    );
  }

  const cards = [
    {
      label: "Total de Chamados",
      value: stats.total,
      icon: Ticket,
      color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
      href: "/admin/tickets",
    },
    {
      label: "Abertos",
      value: stats.abertos,
      icon: AlertTriangle,
      color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
      href: "/admin/tickets?status=aberto",
      highlight: stats.abertos > 0,
    },
    {
      label: "Em Andamento",
      value: stats.emAndamento,
      icon: Clock,
      color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400",
      href: "/admin/tickets?status=em_andamento",
    },
    {
      label: "Aguardando",
      value: stats.aguardando,
      icon: Clock,
      color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400",
      href: "/admin/tickets?status=aguardando_cliente",
    },
    {
      label: "Resolvidos",
      value: stats.resolvidos,
      icon: CheckCircle2,
      color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400",
      href: "/admin/tickets?status=resolvido",
    },
    {
      label: "Fechados",
      value: stats.fechados,
      icon: CheckCircle2,
      color: "text-neutral-600 bg-neutral-100 dark:bg-neutral-800/40 dark:text-neutral-400",
      href: "/admin/tickets?status=fechado",
    },
    {
      label: "Urgentes",
      value: stats.urgentes,
      icon: AlertTriangle,
      color: "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400",
      href: "/admin/tickets?priority=urgente",
      highlight: stats.urgentes > 0,
    },
    {
      label: "Usuários",
      value: stats.totalUsuarios,
      icon: Users,
      color: "text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30 dark:text-cyan-400",
      href: "/admin/tickets",
    },
  ];

  // Últimos tickets
  const recentTickets = tickets?.slice(0, 5) || [];

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <AppLayout>
      <div className="animate-fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Painel Administrativo</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Visão geral dos chamados do sistema
            </p>
          </div>
          <Button onClick={() => navigate("/admin/tickets")} variant="outline" className="gap-2">
            <List className="w-4 h-4" />
            Gerenciar Chamados
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {cards.slice(0, 4).map((card, index) => (
            <motion.button
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(card.href)}
              className={`relative p-5 rounded-2xl bg-card border border-border/50 hover:border-border hover:shadow-md transition-all duration-200 text-left ${
                card.highlight ? "ring-2 ring-primary/20" : ""
              }`}
            >
              {card.highlight && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full animate-pulse" />
              )}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold">{card.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{card.label}</div>
            </motion.button>
          ))}
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {cards.slice(4).map((card, index) => (
            <motion.button
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (index + 4) * 0.05 }}
              onClick={() => navigate(card.href)}
              className={`p-4 rounded-xl bg-card border border-border/50 hover:border-border hover:shadow-sm transition-all duration-200 text-left ${
                card.highlight ? "ring-2 ring-destructive/20" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.color}`}>
                  <card.icon className="w-4 h-4" />
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <div className="text-lg font-bold">{card.value}</div>
              <div className="text-[11px] text-muted-foreground">{card.label}</div>
            </motion.button>
          ))}
        </div>

        {/* Recent Tickets */}
        <div className="rounded-2xl bg-card border border-border/50 shadow-sm">
          <div className="px-6 py-4 border-b border-border/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Chamados Recentes</span>
            </div>
            <Button
              onClick={() => navigate("/admin/tickets")}
              variant="ghost"
              size="sm"
              className="text-xs gap-1"
            >
              Ver Todos
              <ArrowUpRight className="w-3 h-3" />
            </Button>
          </div>
          <div className="divide-y divide-border/30">
            {recentTickets.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum chamado registrado ainda
              </p>
            ) : (
              recentTickets.map((ticket) => (
                <button
                  key={ticket._id}
                  onClick={() => navigate(`/admin/tickets/${ticket._id}`)}
                  className="w-full flex items-center justify-between px-6 py-3.5 hover:bg-accent/50 transition-colors text-left"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{ticket.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {ticket.creator?.name || "Anônimo"} • {formatDateTime(ticket._creationTime)}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${`status-${ticket.status}`} ml-3`}>
                    {ticket.status === "aberto" && "Aberto"}
                    {ticket.status === "em_andamento" && "Em Andamento"}
                    {ticket.status === "aguardando_cliente" && "Aguardando"}
                    {ticket.status === "resolvido" && "Resolvido"}
                    {ticket.status === "fechado" && "Fechado"}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
