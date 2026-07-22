import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AppLayout } from "@/components/AppLayout";
import {
  PlusCircle,
  Search,
  MessageSquare,
  Clock,
  AlertCircle,
  Filter,
  ChevronRight,
} from "lucide-react";
import { useState, useMemo } from "react";
import { STATUS_LABELS, PRIORITY_LABELS } from "@/convex/tickets";

export default function DashboardPage() {
  const navigate = useNavigate();
  const tickets = useQuery(api.tickets.listMyTickets, {});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const filteredTickets = useMemo(() => {
    if (!tickets) return [];
    let filtered = tickets;
    if (statusFilter) {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(s) ||
          t.description.toLowerCase().includes(s)
      );
    }
    return filtered;
  }, [tickets, search, statusFilter]);

  const getStatusColor = (status: string) => {
    return `status-${status}`;
  };

  const getPriorityColor = (priority: string) => {
    return `priority-${priority}`;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const mins = Math.floor(diff / (1000 * 60));
        return `${mins}min atrás`;
      }
      return `${hours}h atrás`;
    }
    if (days === 1) return "Ontem";
    if (days < 7) return `${days} dias atrás`;
    return date.toLocaleDateString("pt-BR");
  };

  const statuses = [
    { value: null, label: "Todos" },
    { value: "aberto", label: "Aberto" },
    { value: "em_andamento", label: "Em Andamento" },
    { value: "aguardando_cliente", label: "Aguardando" },
    { value: "resolvido", label: "Resolvido" },
    { value: "fechado", label: "Fechado" },
  ];

  return (
    <AppLayout>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Meus Chamados</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Acompanhe todos os seus chamados de suporte
            </p>
          </div>
          <Button onClick={() => navigate("/tickets/new")} className="gap-2">
            <PlusCircle className="w-4 h-4" />
            Novo Chamado
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar chamados..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {statuses.map((s) => (
              <button
                key={s.label}
                onClick={() => setStatusFilter(s.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === s.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-accent"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Ticket List */}
        {!tickets ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-pulse text-muted-foreground">Carregando...</div>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <TicketIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-1">Nenhum chamado encontrado</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {search || statusFilter
                ? "Tente ajustar os filtros"
                : "Você ainda não abriu nenhum chamado"}
            </p>
            {!search && !statusFilter && (
              <Button onClick={() => navigate("/tickets/new")} variant="outline" className="gap-2">
                <PlusCircle className="w-4 h-4" />
                Abrir Primeiro Chamado
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTickets.map((ticket) => (
              <button
                key={ticket._id}
                onClick={() => navigate(`/tickets/${ticket._id}`)}
                className="w-full group relative p-4 sm:p-5 rounded-2xl bg-card border border-border/50 hover:border-border hover:shadow-md hover:shadow-primary/5 transition-all duration-200 text-left"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge
                        variant="secondary"
                        className={`${getStatusColor(ticket.status)} text-[10px] px-2 py-0.5 font-medium border-0`}
                      >
                        {STATUS_LABELS[ticket.status] || ticket.status}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className={`${getPriorityColor(ticket.priority)} text-[10px] px-2 py-0.5 font-medium border-0`}
                      >
                        {PRIORITY_LABELS[ticket.priority] || ticket.priority}
                      </Badge>
                      {ticket.category && (
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                          style={{
                            backgroundColor: `${ticket.category.color}20`,
                            color: ticket.category.color,
                          }}
                        >
                          {ticket.category.name}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                      {ticket.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                      {ticket.description}
                    </p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatDate(ticket._creationTime)}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MessageSquare className="w-3 h-3" />
                        {ticket.messageCount}
                      </span>
                      {ticket.assignedTo && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <AlertCircle className="w-3 h-3" />
                          {ticket.assignedTo.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function TicketIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M13 5v2" />
      <path d="M13 17v2" />
      <path d="M13 11v2" />
    </svg>
  );
}
