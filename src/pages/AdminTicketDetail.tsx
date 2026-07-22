import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useNavigate } from "react-router";
import { useState, useRef, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Send,
  Loader2,
  Clock,
  MessageSquare,
  CheckCircle2,
  RotateCcw,
  Phone,
  User,
  Bot,
  UserCheck,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { STATUS_LABELS, PRIORITY_LABELS } from "@/convex/tickets";
import { Id } from "@/convex/_generated/dataModel";

const STATUS_TRANSITIONS: Record<string, string[]> = {
  aberto: ["em_andamento", "fechado"],
  em_andamento: ["aguardando_cliente", "resolvido", "fechado"],
  aguardando_cliente: ["em_andamento", "fechado"],
  resolvido: ["fechado"],
  fechado: ["aberto"],
};

export default function AdminTicketDetailPage() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const ticket = useQuery(api.tickets.getTicket, { ticketId: ticketId as Id<"tickets"> });
  const messages = useQuery(api.ticketMessages.listMessages, { ticketId: ticketId as Id<"tickets"> });
  const agents = useQuery(api.tickets.listAgents, {});
  const addMessage = useMutation(api.ticketMessages.addMessage);
  const updateStatus = useMutation(api.tickets.updateTicketStatus);
  const assignTicket = useMutation(api.tickets.assignTicket);
  const updatePriority = useMutation(api.tickets.updateTicketPriority);

  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !ticketId) return;
    setIsSending(true);
    try {
      await addMessage({
        ticketId: ticketId as Id<"tickets">,
        content: newMessage.trim(),
      });
      setNewMessage("");
    } catch (error) {
      toast.error("Erro ao enviar mensagem");
    } finally {
      setIsSending(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!ticketId) return;
    try {
      await updateStatus({
        ticketId: ticketId as Id<"tickets">,
        newStatus: newStatus as any,
      });
      toast.success(`Status alterado para "${STATUS_LABELS[newStatus]}"`);
    } catch (error: any) {
      toast.error(error.message || "Erro ao alterar status");
    }
  };

  const handleAssign = async (agentId: string) => {
    if (!ticketId) return;
    try {
      await assignTicket({
        ticketId: ticketId as Id<"tickets">,
        agentId: agentId as Id<"users">,
      });
      toast.success("Chamado atribuído com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao atribuir chamado");
    }
  };

  const handlePriorityChange = async (priority: string) => {
    if (!ticketId) return;
    try {
      await updatePriority({
        ticketId: ticketId as Id<"tickets">,
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
    return new Date(timestamp).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!ticket) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-pulse text-muted-foreground">Carregando...</div>
        </div>
      </AppLayout>
    );
  }

  const allowedTransitions = STATUS_TRANSITIONS[ticket.status] || [];

  return (
    <AppLayout>
      <div className="animate-fade-in max-w-5xl mx-auto">
        {/* Back */}
        <button
          onClick={() => navigate("/admin/tickets")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Chamados
        </button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ticket Header */}
            <div className="rounded-2xl bg-card border border-border/50 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <Badge className={`${getStatusColor(ticket.status)} text-xs px-2.5 py-0.5 font-medium border-0`}>
                  {STATUS_LABELS[ticket.status]}
                </Badge>
                <Badge className={`${getPriorityColor(ticket.priority)} text-xs px-2.5 py-0.5 font-medium border-0`}>
                  {PRIORITY_LABELS[ticket.priority]}
                </Badge>
                {ticket.category && (
                  <span
                    className="text-xs px-2.5 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: `${ticket.category.color}20`, color: ticket.category.color }}
                  >
                    {ticket.category.name}
                  </span>
                )}
              </div>

              <h2 className="text-xl font-bold tracking-tight mb-4">{ticket.title}</h2>

              <div className="p-4 rounded-xl bg-muted/50 border border-border/30">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={ticket.creator?.image || undefined} />
                    <AvatarFallback className="text-[9px]">
                      {ticket.creator?.name?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium text-muted-foreground">
                    {ticket.creator?.name || "Usuário"} — {formatDateTime(ticket._creationTime)}
                  </span>
                </div>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {ticket.description}
                </p>
              </div>

              {/* Status Actions */}
              <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border/30">
                {allowedTransitions.map((transition) => (
                  <Button
                    key={transition}
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange(transition)}
                    className="gap-1.5"
                  >
                    {transition === "resolvido" && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {transition === "aberto" && <RotateCcw className="w-3.5 h-3.5" />}
                    {STATUS_LABELS[transition] || transition}
                  </Button>
                ))}
              </div>
            </div>

            {/* Chat Messages */}
            <div className="rounded-2xl bg-card border border-border/50 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-border/30 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Conversa</span>
              </div>

              <div className="px-6 py-4 space-y-4 max-h-[500px] overflow-y-auto">
                {!messages ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                ) : messages.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-8">
                    Nenhuma mensagem ainda
                  </p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`flex gap-3 ${msg.isFromAgent ? "" : "flex-row-reverse"}`}
                    >
                      <Avatar className="w-8 h-8 shrink-0">
                        <AvatarFallback
                          className={`text-[10px] ${
                            msg.isFromAgent
                              ? "bg-primary/10 text-primary"
                              : msg.senderName === "Sistema"
                              ? "bg-muted text-muted-foreground"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          }`}
                        >
                          {msg.senderName === "Sistema" ? (
                            <Bot className="w-3.5 h-3.5" />
                          ) : msg.isFromAgent ? (
                            <User className="w-3.5 h-3.5" />
                          ) : (
                            msg.senderName.charAt(0).toUpperCase()
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`max-w-[75%] ${msg.isFromAgent ? "mr-auto" : "ml-auto"}`}>
                        <div
                          className={`rounded-2xl px-4 py-2.5 ${
                            msg.isFromAgent
                              ? "bg-muted rounded-tl-sm"
                              : msg.senderName === "Sistema"
                              ? "bg-muted/50 text-muted-foreground text-xs italic rounded-xl text-center max-w-full"
                              : "bg-primary/10 rounded-tr-sm"
                          }`}
                        >
                          {msg.senderName !== "Sistema" && (
                            <p className="text-xs font-medium text-primary mb-1">
                              {msg.senderName}
                              {msg.isFromAgent && " (Suporte)"}
                              {msg.isFromWhatsApp && " • WhatsApp"}
                            </p>
                          )}
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        <p className={`text-[10px] text-muted-foreground mt-1 ${msg.isFromAgent ? "text-left" : "text-right"}`}>
                          {formatDateTime(msg._creationTime)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="px-6 py-4 border-t border-border/30 bg-muted/20">
                <div className="flex items-end gap-2">
                  <Textarea
                    placeholder="Digite sua resposta como agente de suporte..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    rows={2}
                    className="min-h-[44px] max-h-[120px] resize-none text-sm bg-background"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={isSending || !newMessage.trim()}
                    className="shrink-0 h-[44px]"
                  >
                    {isSending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Admin Controls */}
          <div className="space-y-4">
            {/* Assignment */}
            <div className="rounded-2xl bg-card border border-border/50 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <UserCheck className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Atribuição</span>
              </div>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Atribuir a</label>
                  <Select
                    value={ticket.assignedTo?.email || ""}
                    onValueChange={(value) => handleAssign(value)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Selecionar agente..." />
                    </SelectTrigger>
                    <SelectContent>
                      {agents?.map((agent) => (
                        <SelectItem key={agent._id} value={agent._id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="w-5 h-5">
                              <AvatarImage src={agent.image || undefined} />
                              <AvatarFallback className="text-[8px]">
                                {agent.name?.charAt(0) || "A"}
                              </AvatarFallback>
                            </Avatar>
                            {agent.name || agent.email}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {ticket.assignedTo && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={ticket.assignedTo.image || undefined} />
                      <AvatarFallback className="text-[8px]">
                        {ticket.assignedTo.name?.charAt(0) || "A"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs font-medium">{ticket.assignedTo.name}</p>
                      <p className="text-[10px] text-muted-foreground">{ticket.assignedTo.email}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Priority */}
            <div className="rounded-2xl bg-card border border-border/50 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Prioridade</span>
              </div>
              <Select value={ticket.priority} onValueChange={handlePriorityChange}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">🟢 Baixa</SelectItem>
                  <SelectItem value="media">🔵 Média</SelectItem>
                  <SelectItem value="alta">🟠 Alta</SelectItem>
                  <SelectItem value="urgente">🔴 Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Cliente Info */}
            <div className="rounded-2xl bg-card border border-border/50 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Cliente</span>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={ticket.creator?.image || undefined} />
                  <AvatarFallback className="text-[10px]">
                    {ticket.creator?.name?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{ticket.creator?.name || "Usuário"}</p>
                  <p className="text-xs text-muted-foreground">{ticket.creator?.email || ""}</p>
                </div>
              </div>

              {ticket.whatsappNumber && (
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/30 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
                      WhatsApp
                    </p>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                      {ticket.whatsappNumber}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="rounded-2xl bg-card border border-border/50 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Informações</span>
              </div>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Criado em</span>
                  <span className="text-foreground">{formatDateTime(ticket._creationTime)}</span>
                </div>
                {ticket.resolvedAt && (
                  <div className="flex justify-between">
                    <span>Resolvido em</span>
                    <span className="text-foreground">{formatDateTime(ticket.resolvedAt)}</span>
                  </div>
                )}
                {ticket.closedAt && (
                  <div className="flex justify-between">
                    <span>Fechado em</span>
                    <span className="text-foreground">{formatDateTime(ticket.closedAt)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>ID</span>
                  <span className="text-foreground font-mono text-[10px]">{ticket._id.slice(0, 12)}...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
