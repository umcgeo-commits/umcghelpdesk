import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useNavigate } from "react-router";
import { useState, useRef, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
} from "lucide-react";
import { toast } from "sonner";
import { STATUS_LABELS, PRIORITY_LABELS } from "@/convex/tickets";
import { Doc, Id } from "@/convex/_generated/dataModel";

type TicketWithRelations = {
  _id: Id<"tickets">;
  _creationTime: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  categoryId?: Id<"ticketCategories">;
  createdBy: Id<"users">;
  assignedTo?: { name?: string; image?: string; email?: string } | null;
  whatsappNumber?: string;
  whatsappInstance?: string;
  closedAt?: number;
  resolvedAt?: number;
  category?: { _id: Id<"ticketCategories">; name: string; color: string; icon?: string } | null;
  creator?: { name?: string; image?: string; email?: string } | null;
};

const STATUS_TRANSITIONS: Record<string, string[]> = {
  aberto: ["em_andamento", "fechado"],
  em_andamento: ["aguardando_cliente", "resolvido", "fechado"],
  aguardando_cliente: ["em_andamento", "fechado"],
  resolvido: ["fechado"],
  fechado: ["aberto"],
};

export default function TicketDetailPage() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const ticket = useQuery(api.tickets.getTicket, { ticketId: ticketId as Id<"tickets"> });
  const messages = useQuery(api.ticketMessages.listMessages, { ticketId: ticketId as Id<"tickets"> });
  const addMessage = useMutation(api.ticketMessages.addMessage);
  const updateStatus = useMutation(api.tickets.updateTicketStatus);
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
  const t = ticket as TicketWithRelations;
  const isClientResponding = ticket.status === "aguardando_cliente";

  return (
    <AppLayout>
      <div className="animate-fade-in max-w-4xl mx-auto">
        {/* Back */}
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>

        {/* Ticket Header Card */}
        <div className="rounded-2xl bg-card border border-border/50 shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge className={`${getStatusColor(ticket.status)} text-xs px-2.5 py-0.5 font-medium border-0`}>
                  {STATUS_LABELS[ticket.status] || ticket.status}
                </Badge>
                <Badge className={`${getPriorityColor(ticket.priority)} text-xs px-2.5 py-0.5 font-medium border-0`}>
                  {PRIORITY_LABELS[ticket.priority] || ticket.priority}
                </Badge>
                {t.category && (
                  <span
                    className="text-xs px-2.5 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: `${t.category.color}20`, color: t.category.color }}
                  >
                    {t.category.name}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold tracking-tight">{ticket.title}</h2>
              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Aberto {formatDateTime(ticket._creationTime)}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  {messages?.length || 0} mensagens
                </span>
                {t.whatsappNumber && (
                  <span className="flex items-center gap-1 text-emerald-600">
                    <Phone className="w-3 h-3" />
                    WhatsApp
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="p-4 rounded-xl bg-muted/50 border border-border/30">
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
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

        {/* Messages Chat */}
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
                  <div
                    className={`max-w-[75%] ${
                      msg.isFromAgent ? "mr-auto" : "ml-auto"
                    }`}
                  >
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
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    </div>
                    <p
                      className={`text-[10px] text-muted-foreground mt-1 ${
                        msg.isFromAgent ? "text-left" : "text-right"
                      }`}
                    >
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
                placeholder={
                  isClientResponding
                    ? "O atendente está aguardando sua resposta..."
                    : "Digite sua mensagem..."
                }
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
            <p className="text-[10px] text-muted-foreground mt-1.5">
              Pressione Enter para enviar • Shift+Enter para nova linha
            </p>
          </div>
        </div>

        {/* WhatsApp Info */}
        {t.whatsappNumber && (
          <div className="mt-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/30 flex items-center gap-3">
            <Phone className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                Notificações WhatsApp Ativadas
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                Você receberá atualizações deste chamado no número {t.whatsappNumber}
              </p>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
