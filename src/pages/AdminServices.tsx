import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Trash2, Edit3, Wrench, Building2, Loader2, Clock } from "lucide-react";
import { toast } from "sonner";

interface FormData { name: string; description: string; departmentId: string; color: string; sla_hours: number; }
const defaultForm: FormData = { name: "", description: "", departmentId: "", color: "#6366f1", sla_hours: 24 };

const PRESET_COLORS = ["#3b82f6","#8b5cf6","#ec4899","#ef4444","#f97316","#22c55e","#14b8a6","#6366f1","#a855f7"];

export default function AdminServicesPage() {
  const services = useQuery(api.services.listServices, {});
  const departments = useQuery(api.departments.listDepartments);
  const create = useMutation(api.services.createService);
  const update = useMutation(api.services.updateService);
  const remove = useMutation(api.services.deleteService);

  const [isCreate, setIsCreate] = useState(false);
  const [editId, setEditId] = useState<Id<"services"> | null>(null);
  const [deleteId, setDeleteId] = useState<Id<"services"> | null>(null);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [loading, setLoading] = useState(false);

  const reset = () => { setForm(defaultForm); setEditId(null); };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Nome obrigatório");
    if (!form.departmentId) return toast.error("Selecione um departamento");
    setLoading(true);
    try {
      await create({ name: form.name.trim(), description: form.description.trim()||undefined, departmentId: form.departmentId as Id<"departments">, color: form.color||undefined, sla_hours: form.sla_hours||undefined });
      toast.success("Serviço criado!"); setIsCreate(false); reset();
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()||!editId||!form.departmentId) return;
    setLoading(true);
    try {
      await update({ serviceId: editId, name: form.name.trim(), description: form.description.trim()||undefined, departmentId: form.departmentId as Id<"departments">, color: form.color||undefined, sla_hours: form.sla_hours||undefined });
      toast.success("Serviço atualizado!"); setEditId(null); reset();
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await remove({ serviceId: deleteId }); toast.success("Serviço removido!"); setDeleteId(null); }
    catch (e: any) { toast.error(e.message); }
  };

  const openEdit = (s: NonNullable<typeof services>[number]) => {
    setEditId(s._id);
    setForm({ name: s.name, description: s.description||"", departmentId: s.departmentId, color: s.color||"#6366f1", sla_hours: s.sla_hours||24 });
  };

  return (
    <AppLayout>
      <div className="animate-fade-in">
        <div className="flex items-start sm:items-center justify-between gap-4 mb-8">
          <div><h2 className="text-2xl font-bold tracking-tight">Serviços</h2><p className="text-sm text-muted-foreground mt-1">Gerencie os serviços oferecidos por cada departamento</p></div>
          <Dialog open={isCreate} onOpenChange={setIsCreate}>
            <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" />Novo Serviço</Button></DialogTrigger>
            <DialogContent><DialogHeader><DialogTitle>Novo Serviço</DialogTitle><DialogDescription>Adicione um serviço vinculado a um departamento.</DialogDescription></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 py-2">
                <div className="space-y-2"><Label>Nome <span className="text-destructive">*</span></Label><Input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Ex: Suporte a Software"/></div>
                <div className="space-y-2"><Label>Departamento <span className="text-destructive">*</span></Label><Select value={form.departmentId} onValueChange={v=>setForm({...form,departmentId:v})}><SelectTrigger className="h-10"><SelectValue placeholder="Selecionar..."/></SelectTrigger><SelectContent>{departments?.map(d=>(<SelectItem key={d._id} value={d._id}><div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor:d.color}}/>{d.name}</div></SelectItem>))}</SelectContent></Select></div>
                <div className="space-y-2"><Label>Descrição</Label><Textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={2}/></div>
                <div className="space-y-2"><Label>Cor</Label><div className="flex flex-wrap gap-2">{PRESET_COLORS.map(c=>(<button key={c} type="button" onClick={()=>setForm({...form,color:c})} className={`w-8 h-8 rounded-lg transition-all ${form.color===c?"ring-2 ring-offset-2 ring-foreground scale-110":"hover:scale-110"}`} style={{backgroundColor:c}}/>))}</div></div>
                <div className="space-y-2"><Label>SLA (horas)</Label><Input type="number" min={1} value={form.sla_hours} onChange={e=>setForm({...form,sla_hours:parseInt(e.target.value)||24})}/></div>
                <DialogFooter><Button type="button" variant="outline" onClick={()=>{setIsCreate(false);reset();}}>Cancelar</Button><Button type="submit" disabled={loading}>{loading?<><Loader2 className="w-4 h-4 animate-spin mr-1"/>Criando...</>:"Criar"}</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Dialog open={!!editId} onOpenChange={o=>{if(!o){setEditId(null);reset();}}}>
          <DialogContent><DialogHeader><DialogTitle>Editar Serviço</DialogTitle></DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-4 py-2">
              <div className="space-y-2"><Label>Nome <span className="text-destructive">*</span></Label><Input value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div>
              <div className="space-y-2"><Label>Departamento</Label><Select value={form.departmentId} onValueChange={v=>setForm({...form,departmentId:v})}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{departments?.map(d=>(<SelectItem key={d._id} value={d._id}>{d.name}</SelectItem>))}</SelectContent></Select></div>
              <div className="space-y-2"><Label>SLA (horas)</Label><Input type="number" min={1} value={form.sla_hours} onChange={e=>setForm({...form,sla_hours:parseInt(e.target.value)||24})}/></div>
              <DialogFooter><Button type="button" variant="outline" onClick={()=>{setEditId(null);reset();}}>Cancelar</Button><Button type="submit" disabled={loading}>{loading?<><Loader2 className="w-4 h-4 animate-spin mr-1"/>Salvando...</>:"Salvar"}</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!deleteId} onOpenChange={o=>!o&&setDeleteId(null)}>
          <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Remover Serviço</AlertDialogTitle></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive">Remover</AlertDialogAction></AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {!services ? <div className="animate-pulse text-center py-20 text-muted-foreground">Carregando...</div> : services.length===0 ? (
          <div className="text-center py-20"><div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4"><Wrench className="w-8 h-8 text-muted-foreground"/></div><h3 className="font-semibold mb-1">Nenhum serviço</h3><p className="text-sm text-muted-foreground mb-4">Crie departamentos primeiro, depois adicione serviços</p></div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {services.map(s=>(
              <div key={s._id} className="group relative p-5 rounded-2xl bg-card border border-border/50 hover:border-border hover:shadow-md transition-all duration-200">
                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{backgroundColor:s.color||s.department?.color}}/>
                <div className="mt-2">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold" style={{backgroundColor:s.color||s.department?.color||"#6366f1"}}>{s.name.charAt(0).toUpperCase()}</div>
                    <div><h3 className="font-semibold truncate">{s.name}</h3><p className="flex items-center gap-1 text-[10px] text-muted-foreground"><Building2 className="w-3 h-3"/>{s.department?.name||"Sem dept."}</p></div>
                  </div>
                  {s.description&&<p className="text-xs text-muted-foreground line-clamp-2 mb-2">{s.description}</p>}
                  {s.sla_hours&&<div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/50 rounded-lg px-2 py-1 w-fit"><Clock className="w-3 h-3"/>SLA: {s.sla_hours}h</div>}
                </div>
                <div className="flex items-center mt-3 pt-3 border-t border-border/20"><div className="w-4 h-4 rounded-md" style={{backgroundColor:s.color||s.department?.color||"#6366f1"}}/><div className="ml-auto flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={()=>openEdit(s)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"><Edit3 className="w-3.5 h-3.5"/></button><button onClick={()=>setDeleteId(s._id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5"><Trash2 className="w-3.5 h-3.5"/></button></div></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
