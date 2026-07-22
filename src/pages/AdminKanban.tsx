import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useMemo, useRef } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router";
import { STATUS_LABELS, PRIORITY_LABELS } from "@/convex/tickets";
import { Clock, MessageSquare, ChevronRight, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

const STATUS_ORDER = ["aberto", "em_andamento", "aguardando_cliente", "resolvido", "fechado"];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  aberto: { label: "Aberto", color: "text-blue-700 dark:text-blue-300", bg: "bg-blue-50 dark:bg-blue-950/40" },
  em_andamento: { label: "Em Andamento", color: "text-amber-700 dark:text-amber-300", bg: "bg-amber-50 dark:bg-amber-950/40" },
  aguardando_cliente: { label: "Aguardando", color: "text-purple-700 dark:text-purple-300", bg: "bg-purple-50 dark:bg-purple-950/40" },
  resolvido: { label: "Resolvido", color: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
  fechado: { label: "Fechado", color: "text-neutral-600 dark:text-neutral-400", bg: "bg-neutral-50 dark:bg-neutral-900/40" },
};

export default function AdminKanbanPage() {
  const navigate = useNavigate();
  const tickets = useQuery(api.tickets.listAllTickets, {});
  const updateStatus = useMutation(api.tickets.updateTicketStatus);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<string | null>(null);

  const columns = useMemo(() => {
    if (!tickets) return [];
    return STATUS_ORDER.map((status) => ({
      status,
      ...STATUS_CONFIG[status],
      tickets: tickets.filter((t) => t.status === status),
    }));
  }, [tickets]);

  const handleDragStart = (ticketId: string) => {
    setDraggingId(ticketId);
  };

  const handleDragOver = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    setDragOverStatus(status);
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    setDragOverStatus(null);
    const ticketId = draggingId;
    if (!ticketId) return;

    setDraggingId(null);

    try {
      await updateStatus({
        ticketId: ticketId as Id<"tickets">,
        newStatus: newStatus as any,
      });
      toast.success(`Chamado movido para "${STATUS_LABELS[newStatus]}"`);
    } catch (error: any) {
      toast.error(error.message || "Transição inválida");
    }
  };

  const getPriorityColor = (p: string) => `priority-${p}`;
  const formatDate = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return `${Math.floor(diff / (1000 * 60))}min`;
    if (hours < 24) return `${hours}h`;
    return d.toLocaleDateString("pt-BR");
  };

  if (!tickets) {
    return <AppLayout><div className="animate-pulse text-center py-20 text-muted-foreground">Carregando...</div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="animate-fade-in">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Kanban</h2>
          <p className="text-sm text-muted-foreground mt-1">Arraste os chamados entre as colunas para alterar o status</p>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 min-h-[calc(100vh-220px)]" style={{ scrollbarWidth: "thin" }}>
          {columns.map((col) => (
            <div
              key={col.status}
              className={`flex-shrink-0 w-72 rounded-2xl ${col.bg} border border-border/40 transition-all duration-200 ${dragOverStatus === col.status ? "ring-2 ring-primary/30 scale-[1.02]" : ""}`}
              onDragOver={(e) => handleDragOver(e, col.status)}
              onDragLeave={() => setDragOverStatus(null)}
              onDrop={(e) => handleDrop(e, col.status)}
            >
              {/* Column Header */}
              <div className="sticky top-0 p-4 pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${col.color.replace("text-", "bg-").replace("dark:text-", "dark:bg-")}`} />
                    <h3 className="font-semibold text-sm">{col.label}</h3>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground bg-background/80 px-2 py-0.5 rounded-full">
                    {col.tickets.length}
                  </span>
                </div>
              </div>

              {/* Cards */}
              <div className="px-3 pb-3 space-y-2">
                {col.tickets.length === 0 ? (
                  <div className="text-center py-8 text-xs text-muted-foreground">
                    <div className="w-10 h-10 rounded-xl bg-background/50 flex items-center justify-center mx-auto mb-2">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    Nenhum chamado
                  </div>
                ) : (
                  col.tickets.map((ticket) => (
                    <div
                      key={ticket._id}
                      draggable
                      onDragStart={() => handleDragStart(ticket._id)}
                      onClick={() => navigate(`/admin/tickets/${ticket._id}`)}
                      className={`p-3.5 rounded-xl bg-card border border-border/50 hover:border-border hover:shadow-md cursor-grab active:cursor-grabbing transition-all duration-200 ${draggingId === ticket._id ? "opacity-50 scale-95" : ""}`}
                    >
                      <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                        <Badge className={`${getPriorityColor(ticket.priority)} text-[9px] px-1.5 py-0 font-medium border-0`}>
                          {PRIORITY_LABELS[ticket.priority]}
                        </Badge>
                      </div>
                      <p className="text-xs font-semibold leading-snug mb-2 line-clamp-2">
                        {ticket.title}
                      </p>
                      {ticket.description && (
                        <p className="text-[10px] text-muted-foreground line-clamp-2 mb-2">
                          {ticket.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(ticket._creationTime)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {ticket.messageCount}
                        </span>
                      </div>
                      {ticket.assignedTo && (
                        <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-border/20">
                          <Avatar className="w-4 h-4">
                            <AvatarFallback className="text-[6px] bg-primary/10 text-primary">
                              {ticket.assignedTo.name?.charAt(0) || "A"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-[9px] text-muted-foreground truncate">
                            {ticket.assignedTo.name}
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
