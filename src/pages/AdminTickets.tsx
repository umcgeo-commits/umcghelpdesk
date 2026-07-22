import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate, useSearchParams } from "react-router";
import { useState, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Clock,
  MessageSquare,
  ChevronRight,
  Filter,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { STATUS_LABELS, PRIORITY_LABELS } from "@/convex/tickets";
import { Id } from "@/convex/_generated/dataModel";

export default function AdminTicketsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tickets = useQuery(api.tickets.listAllTickets, {});
  const agents = useQuery(api.tickets.listAgents, {});
  const assignTicket = useMutation(api.tickets.assignTicket);
  const updatePriority = useMutation(api.tickets.updateTicketPriority);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(
    searchParams.get("status") || null
  );
  const [priorityFilter, setPriorityFilter] = useState<string | null>(
    searchParams.get("priority") || null
  );
  const [assigningId, setAssigningId] = useState<string | null>(null);

  const filteredTickets = useMemo(() => {
    if (!tickets) return [];
    let filtered = tickets;
    if (statusFilter) filtered = filtered.filter((t) => t.status === statusFilter);
    if (priorityFilter) filtered = filtered.filter((t) => t.priority === priorityFilter);
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (t) => t.title.toLowerCase().includes(s) || t.description.toLowerCase().includes(s)
      );
    }
    return filtered;
  }, [tickets, search, statusFilter, priorityFilter]);

  const handleAssign = async (ticketId: Id<"tickets">, agentId: Id<"users">) => {
    setAssigningId(ticketId);
    try {
      await assignTicket({ ticketId, agentId });
      toast.success("Chamado atribuído com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao atribuir chamado");
    } finally {
      setAssigningId(null);
    }
  };

  const handlePriorityChange = async (ticketId: Id<"tickets">, priority: string) => {
    try {
      await updatePriority({
        ticketId,
        priority: priority as "baixa" | "media" | "alta" | "urgente",
      });
      toast.success("Prioridade atualizada!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar prioridade");
    }
  };

  const getStatusColor = (status: string) => `status-${status}`;
  const getPriorityColor = (priority: string) => `priority-${priority}`;

  const formatDateTime = (timestamp: number) => {
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Gerenciar Chamados</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {tickets?.length || 0} chamados no total
            </p>
          </div>
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

        {/* Tickets Table */}
        {!tickets ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-pulse text-muted-foreground">Carregando...</div>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-1">Nenhum chamado encontrado</h3>
            <p className="text-sm text-muted-foreground">Tente ajustar os filtros</p>
          </div>
        ) : (
          <div className="rounded-2xl bg-card border border-border/50 shadow-sm overflow-hidden">
            {/* Table Header - Desktop */}
            <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 border-b border-border/30 bg-muted/30 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <div className="col-span-4">Chamado</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Cliente</div>
              <div className="col-span-2">Atribuído</div>
              <div className="col-span-1 text-center">Msgs</div>
              <div className="col-span-1">Data</div>
            </div>

            <div className="divide-y divide-border/30">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket._id}
                  className="group lg:grid lg:grid-cols-12 lg:gap-4 px-4 sm:px-6 py-4 hover:bg-accent/30 transition-colors cursor-pointer"
                  onClick={() => navigate(`/admin/tickets/${ticket._id}`)}
                >
                  {/* Title - Mobile/Desktop */}
                  <div className="lg:col-span-4 mb-2 lg:mb-0">
                    <div className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5 lg:hidden" />
                      <div>
                        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                          {ticket.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1 lg:hidden">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(ticket.status)}`}>
                            {STATUS_LABELS[ticket.status]}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${getPriorityColor(ticket.priority)}`}>
                            {PRIORITY_LABELS[ticket.priority]}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status - Desktop */}
                  <div className="hidden lg:flex lg:col-span-2 items-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(ticket.status)}`}>
                      {STATUS_LABELS[ticket.status]}
                    </span>
                  </div>

                  {/* Customer - Desktop */}
                  <div className="hidden lg:flex lg:col-span-2 items-center">
                    <span className="text-sm truncate">
                      {ticket.creator?.name || ticket.creator?.email || "Anônimo"}
                    </span>
                  </div>

                  {/* Assigned - Desktop */}
                  <div className="hidden lg:flex lg:col-span-2 items-center gap-2">
                    {ticket.assignedTo ? (
                      <span className="text-sm">{ticket.assignedTo.name}</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Não atribuído</span>
                    )}
                  </div>

                  {/* Messages Count */}
                  <div className="hidden lg:flex lg:col-span-1 items-center justify-center">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MessageSquare className="w-3 h-3" />
                      {ticket.messageCount}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="hidden lg:flex lg:col-span-1 items-center">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {formatDateTime(ticket._creationTime)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
