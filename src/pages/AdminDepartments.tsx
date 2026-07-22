import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Trash2, Edit3, Building2, Loader2 } from "lucide-react";
import { toast } from "sonner";

const PRESET_COLORS = ["#3b82f6","#8b5cf6","#ec4899","#ef4444","#f97316","#eab308","#22c55e","#14b8a6","#06b6d4","#6366f1","#a855f7","#64748b"];

interface FormData { name: string; description: string; color: string; order: number; }
const defaultForm: FormData = { name: "", description: "", color: "#3b82f6", order: 0 };

export default function AdminDepartmentsPage() {
  const depts = useQuery(api.departments.listDepartments);
  const create = useMutation(api.departments.createDepartment);
  const update = useMutation(api.departments.updateDepartment);
  const remove = useMutation(api.departments.deleteDepartment);

  const [isCreate, setIsCreate] = useState(false);
  const [editId, setEditId] = useState<Id<"departments"> | null>(null);
  const [deleteId, setDeleteId] = useState<Id<"departments"> | null>(null);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [loading, setLoading] = useState(false);

  const reset = () => { setForm(defaultForm); setEditId(null); };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); if (!form.name.trim()) return toast.error("Nome obrigatório");
    setLoading(true);
    try {
      await create({ name: form.name.trim(), description: form.description.trim()||undefined, color: form.color, order: form.order||undefined });
      toast.success("Departamento criado!"); setIsCreate(false); reset();
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault(); if (!form.name.trim()||!editId) return;
    setLoading(true);
    try {
      await update({ departmentId: editId, name: form.name.trim(), description: form.description.trim()||undefined, color: form.color, order: form.order||undefined });
      toast.success("Departamento atualizado!"); setEditId(null); reset();
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await remove({ departmentId: deleteId }); toast.success("Departamento removido!"); setDeleteId(null); }
    catch (e: any) { toast.error(e.message); }
  };

  const openEdit = (d: NonNullable<typeof depts>[number]) => {
    setEditId(d._id); setForm({ name: d.name, description: d.description||"", color: d.color, order: d.order||0 });
  };

  return (
    <AppLayout>
      <div className="animate-fade-in">
        <div className="flex items-start sm:items-center justify-between gap-4 mb-8">
          <div><h2 className="text-2xl font-bold tracking-tight">Departamentos</h2><p className="text-sm text-muted-foreground mt-1">Gerencie os departamentos de suporte</p></div>
          <Dialog open={isCreate} onOpenChange={setIsCreate}>
            <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" />Novo Departamento</Button></DialogTrigger>
            <DialogContent><DialogHeader><DialogTitle>Novo Departamento</DialogTitle><DialogDescription>Adicione um departamento para organizar os chamados.</DialogDescription></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 py-2">
                <div className="space-y-2"><Label>Nome <span className="text-destructive">*</span></Label><Input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Ex: Suporte Técnico" required/></div>
                <div className="space-y-2"><Label>Descrição</Label><Textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={2}/></div>
                <div className="space-y-2"><Label>Cor</Label><div className="flex flex-wrap gap-2">{PRESET_COLORS.map(c=>(<button key={c} type="button" onClick={()=>setForm({...form,color:c})} className={`w-8 h-8 rounded-lg transition-all ${form.color===c?"ring-2 ring-offset-2 ring-foreground scale-110":"hover:scale-110"}`} style={{backgroundColor:c}}/>))}</div></div>
                <div className="space-y-2"><Label>Ordem</Label><Input type="number" min={0} value={form.order} onChange={e=>setForm({...form,order:parseInt(e.target.value)||0})}/></div>
                <DialogFooter><Button type="button" variant="outline" onClick={()=>{setIsCreate(false);reset();}}>Cancelar</Button><Button type="submit" disabled={loading}>{loading?<><Loader2 className="w-4 h-4 animate-spin mr-1"/>Criando...</>:"Criar"}</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Dialog open={!!editId} onOpenChange={o=>{if(!o){setEditId(null);reset();}}}>
          <DialogContent><DialogHeader><DialogTitle>Editar Departamento</DialogTitle></DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-4 py-2">
              <div className="space-y-2"><Label>Nome <span className="text-destructive">*</span></Label><Input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></div>
              <div className="space-y-2"><Label>Descrição</Label><Textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={2}/></div>
              <div className="space-y-2"><Label>Cor</Label><div className="flex flex-wrap gap-2">{PRESET_COLORS.map(c=>(<button key={c} type="button" onClick={()=>setForm({...form,color:c})} className={`w-8 h-8 rounded-lg transition-all ${form.color===c?"ring-2 ring-offset-2 ring-foreground scale-110":"hover:scale-110"}`} style={{backgroundColor:c}}/>))}</div></div>
              <DialogFooter><Button type="button" variant="outline" onClick={()=>{setEditId(null);reset();}}>Cancelar</Button><Button type="submit" disabled={loading}>{loading?<><Loader2 className="w-4 h-4 animate-spin mr-1"/>Salvando...</>:"Salvar"}</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!deleteId} onOpenChange={o=>!o&&setDeleteId(null)}>
          <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Remover Departamento</AlertDialogTitle><AlertDialogDescription>Os serviços vinculados não serão removidos, mas o departamento deixará de existir.</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive">Remover</AlertDialogAction></AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {!depts ? <div className="animate-pulse text-center py-20 text-muted-foreground">Carregando...</div> : depts.length===0 ? (
          <div className="text-center py-20"><div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4"><Building2 className="w-8 h-8 text-muted-foreground"/></div><h3 className="font-semibold mb-1">Nenhum departamento</h3><p className="text-sm text-muted-foreground mb-4">Crie departamentos para organizar os chamados</p><Button variant="outline" className="gap-2" onClick={()=>setIsCreate(true)}><Plus className="w-4 h-4"/>Criar Primeiro</Button></div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {depts.map(d=>(
              <div key={d._id} className="group relative p-5 rounded-2xl bg-card border border-border/50 hover:border-border hover:shadow-md transition-all duration-200">
                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{backgroundColor:d.color}}/>
                <div className="mt-2"><div className="flex items-center gap-2.5 mb-2"><div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold" style={{backgroundColor:d.color}}>{d.name.charAt(0).toUpperCase()}</div><div><h3 className="font-semibold truncate">{d.name}</h3></div></div>{d.description&&<p className="text-xs text-muted-foreground line-clamp-2">{d.description}</p>}</div>
                <div className="flex items-center mt-3 pt-3 border-t border-border/20"><div className="w-4 h-4 rounded-md" style={{backgroundColor:d.color}}/><span className="text-[10px] font-mono text-muted-foreground ml-1.5">{d.color}</span><div className="ml-auto flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={()=>openEdit(d)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"><Edit3 className="w-3.5 h-3.5"/></button><button onClick={()=>setDeleteId(d._id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5"><Trash2 className="w-3.5 h-3.5"/></button></div></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
