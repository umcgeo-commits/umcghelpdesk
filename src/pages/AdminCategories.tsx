import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Trash2,
  Edit3,
  Layers,
  Palette,
  Hash,
  GripVertical,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

const PRESET_COLORS = [
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#6366f1", // indigo
  "#a855f7", // purple
  "#64748b", // slate
];

const CATEGORY_ICONS = [
  { value: "bug", label: "Bug" },
  { value: "desktop", label: "Desktop" },
  { value: "globe", label: "Web" },
  { value: "smartphone", label: "Mobile" },
  { value: "server", label: "Servidor" },
  { value: "shield", label: "Segurança" },
  { value: "credit-card", label: "Pagamento" },
  { value: "users", label: "Usuários" },
  { value: "shopping-cart", label: "Vendas" },
  { value: "settings", label: "Configuração" },
];

interface CategoryFormData {
  name: string;
  description: string;
  color: string;
  icon: string;
  order: number;
}

const defaultFormData: CategoryFormData = {
  name: "",
  description: "",
  color: "#3b82f6",
  icon: "",
  order: 0,
};

export default function AdminCategoriesPage() {
  const categories = useQuery(api.ticketCategories.listCategories);
  const createCategory = useMutation(api.ticketCategories.createCategory);
  const updateCategory = useMutation(api.ticketCategories.updateCategory);
  const deleteCategory = useMutation(api.ticketCategories.deleteCategory);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Id<"ticketCategories"> | null>(null);
  const [editingId, setEditingId] = useState<Id<"ticketCategories"> | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => setFormData(defaultFormData);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Nome da categoria é obrigatório");
      return;
    }
    setIsSubmitting(true);
    try {
      await createCategory({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        color: formData.color,
        icon: formData.icon || undefined,
        order: formData.order || undefined,
      });
      toast.success("Categoria criada com sucesso!");
      setIsCreateOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar categoria");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !editingId) {
      toast.error("Nome da categoria é obrigatório");
      return;
    }
    setIsSubmitting(true);
    try {
      await updateCategory({
        categoryId: editingId,
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        color: formData.color,
        icon: formData.icon || undefined,
        order: formData.order || undefined,
      });
      toast.success("Categoria atualizada com sucesso!");
      setIsEditOpen(false);
      setEditingId(null);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar categoria");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCategory({ categoryId: deleteTarget });
      toast.success("Categoria removida com sucesso!");
      setDeleteTarget(null);
    } catch (error: any) {
      toast.error(error.message || "Erro ao remover categoria");
    }
  };

  const openEdit = (category: NonNullable<typeof categories>[number]) => {
    setEditingId(category._id);
    setFormData({
      name: category.name,
      description: category.description || "",
      color: category.color,
      icon: category.icon || "",
      order: category.order || 0,
    });
    setIsEditOpen(true);
  };

  return (
    <AppLayout>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Categorias</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Gerencie as categorias dos chamados de suporte
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Nova Categoria
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
              <DialogHeader>
                <DialogTitle>Nova Categoria</DialogTitle>
                <DialogDescription>
                  Adicione uma nova categoria para classificar os chamados.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome <span className="text-destructive">*</span></Label>
                  <Input
                    id="name"
                    placeholder="Ex: Problemas Técnicos"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="desc">Descrição</Label>
                  <Textarea
                    id="desc"
                    placeholder="Breve descrição da categoria"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Cor</Label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-8 h-8 rounded-lg transition-all ${
                          formData.color === color
                            ? "ring-2 ring-offset-2 ring-foreground scale-110"
                            : "hover:scale-110"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-muted-foreground">Custom:</span>
                    <Input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-10 h-8 p-0.5 cursor-pointer"
                    />
                    <span className="text-xs font-mono text-muted-foreground">{formData.color}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="order">Ordem</Label>
                  <Input
                    id="order"
                    type="number"
                    min={0}
                    placeholder="0"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Números menores aparecem primeiro na lista
                  </p>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => { setIsCreateOpen(false); resetForm(); }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <><Loader2 className="w-4 h-4 animate-spin mr-1" /> Criando...</>
                    ) : (
                      "Criar Categoria"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Editar Categoria</DialogTitle>
              <DialogDescription>
                Atualize as informações da categoria.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEdit} className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome <span className="text-destructive">*</span></Label>
                <Input
                  id="edit-name"
                  placeholder="Ex: Problemas Técnicos"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-desc">Descrição</Label>
                <Textarea
                  id="edit-desc"
                  placeholder="Breve descrição da categoria"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Cor</Label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-8 h-8 rounded-lg transition-all ${
                        formData.color === color
                          ? "ring-2 ring-offset-2 ring-foreground scale-110"
                          : "hover:scale-110"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-muted-foreground">Custom:</span>
                  <Input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-10 h-8 p-0.5 cursor-pointer"
                  />
                  <span className="text-xs font-mono text-muted-foreground">{formData.color}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-order">Ordem</Label>
                <Input
                  id="edit-order"
                  type="number"
                  min={0}
                  placeholder="0"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setIsEditOpen(false); setEditingId(null); resetForm(); }}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-1" /> Salvando...</>
                  ) : (
                    "Salvar Alterações"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remover Categoria</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja remover esta categoria? Chamados existentes não serão afetados,
                mas não poderão mais usar esta categoria.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                Remover
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Categories List */}
        {!categories ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-pulse text-muted-foreground">Carregando...</div>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Layers className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-1">Nenhuma categoria</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Crie categorias para organizar melhor os chamados
            </p>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setIsCreateOpen(true)}
            >
              <Plus className="w-4 h-4" />
              Criar Primeira Categoria
            </Button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <div
                key={cat._id}
                className="group relative p-5 rounded-2xl bg-card border border-border/50 hover:border-border hover:shadow-md hover:shadow-primary/5 transition-all duration-200"
              >
                {/* Color bar at top */}
                <div
                  className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                  style={{ backgroundColor: cat.color }}
                />

                <div className="flex items-start justify-between mt-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-2">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold"
                        style={{ backgroundColor: cat.color }}
                      >
                        {cat.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground truncate">{cat.name}</h3>
                        {cat.order !== undefined && (
                          <p className="text-[10px] text-muted-foreground">
                            Ordem: {cat.order}
                          </p>
                        )}
                      </div>
                    </div>
                    {cat.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {cat.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Color indicator */}
                <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-border/20">
                  <div
                    className="w-4 h-4 rounded-md"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-[10px] font-mono text-muted-foreground">{cat.color}</span>
                  <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(cat)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      title="Editar"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(cat._id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
                      title="Remover"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
