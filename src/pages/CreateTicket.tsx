import { useState } from "react";
import { useNavigate } from "react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Send,
  Loader2,
  HelpCircle,
  AlertTriangle,
  Phone,
} from "lucide-react";
import { toast } from "sonner";

export default function CreateTicketPage() {
  const navigate = useNavigate();
  const categories = useQuery(api.ticketCategories.listCategories);
  const createTicket = useMutation(api.tickets.createTicket);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "media",
    categoryId: "",
    whatsappNumber: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setIsSubmitting(true);
    try {
      const ticketId = await createTicket({
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority as "baixa" | "media" | "alta" | "urgente",
        categoryId: formData.categoryId ? (formData.categoryId as any) : undefined,
        whatsappNumber: formData.whatsappNumber ? formData.whatsappNumber.replace(/\D/g, "") : undefined,
      });
      toast.success("Chamado aberto com sucesso!");
      navigate(`/tickets/${ticketId}`);
    } catch (error) {
      toast.error("Erro ao abrir chamado. Tente novamente.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="animate-fade-in max-w-2xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Meus Chamados
        </button>

        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-6">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <HelpCircle className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Abrir Chamado</CardTitle>
            <CardDescription>
              Descreva seu problema para que possamos ajudar da melhor forma possível.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Título do Chamado <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Ex: Problema com acesso ao sistema"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="h-10"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium">
                  Categoria
                </Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          {cat.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label htmlFor="priority" className="text-sm font-medium">
                  Prioridade
                </Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Selecione a prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa">
                      <div className="flex items-center gap-2">🟢 Baixa</div>
                    </SelectItem>
                    <SelectItem value="media">
                      <div className="flex items-center gap-2">🔵 Média</div>
                    </SelectItem>
                    <SelectItem value="alta">
                      <div className="flex items-center gap-2">🟠 Alta</div>
                    </SelectItem>
                    <SelectItem value="urgente">
                      <div className="flex items-center gap-2">🔴 Urgente</div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* WhatsApp Number */}
              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="text-sm font-medium flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-500" />
                  WhatsApp para Notificações
                </Label>
                <Input
                  id="whatsapp"
                  placeholder="(11) 99999-9999"
                  value={formData.whatsappNumber}
                  onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                  className="h-10"
                />
                <p className="text-xs text-muted-foreground">
                  Opcional. Receba atualizações do chamado via WhatsApp.
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Descrição do Problema <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Descreva detalhadamente o problema que você está enfrentando..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={6}
                  className="resize-y min-h-[120px]"
                />
              </div>

              {/* Submit */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting} className="gap-2">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Abrir Chamado
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
