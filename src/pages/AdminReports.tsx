import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from "recharts";
import { Download, Calendar, TrendingUp, BarChart3, PieChart as PieChartIcon } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  aberto: "#3b82f6",
  em_andamento: "#f59e0b",
  aguardando_cliente: "#a855f7",
  resolvido: "#22c55e",
  fechado: "#64748b",
};

const PRIORITY_COLORS: Record<string, string> = {
  baixa: "#3b82f6",
  media: "#22c55e",
  alta: "#f97316",
  urgente: "#ef4444",
};

export default function AdminReportsPage() {
  const stats = useQuery(api.tickets.getReportStats, {});
  const [monthsBack, setMonthsBack] = useState(6);

  const statusData = useMemo(() => {
    if (!stats) return [];
    return Object.entries(stats.byStatus).map(([name, value]) => ({
      name: name === "em_andamento" ? "Em Andamento" : name === "aguardando_cliente" ? "Aguardando" : name.charAt(0).toUpperCase() + name.slice(1),
      value,
      fill: STATUS_COLORS[name] || "#64748b",
    }));
  }, [stats]);

  const priorityData = useMemo(() => {
    if (!stats) return [];
    return Object.entries(stats.byPriority).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      fill: PRIORITY_COLORS[name] || "#64748b",
    }));
  }, [stats]);

  const departmentData = useMemo(() => {
    if (!stats) return [];
    return stats.byDepartment.map((d) => ({ name: d.name, value: d.count, fill: d.color }));
  }, [stats]);

  const agentData = useMemo(() => {
    if (!stats) return [];
    return stats.byAgent.map((a) => ({ name: a.name, Atribuídos: a.assigned, Resolvidos: a.resolved }));
  }, [stats]);

  const exportCSV = () => {
    if (!stats) return;
    const rows = [["Métrica", "Valor"]];
    Object.entries(stats.byStatus).forEach(([k, v]) => rows.push([`Status: ${k}`, String(v)]));
    Object.entries(stats.byPriority).forEach(([k, v]) => rows.push([`Prioridade: ${k}`, String(v)]));
    stats.byDepartment.forEach((d) => rows.push([`Departamento: ${d.name}`, String(d.count)]));
    stats.byAgent.forEach((a) => rows.push([`Agente: ${a.name} (atribuídos)`, String(a.assigned)]));
    stats.byAgent.forEach((a) => rows.push([`Agente: ${a.name} (resolvidos)`, String(a.resolved)]));
    stats.byMonth.forEach((m) => rows.push([`Mês: ${m.month} (total)`, String(m.total)]));
    stats.byMonth.forEach((m) => rows.push([`Mês: ${m.month} (resolvidos)`, String(m.resolvidos)]));

    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `relatorio-helpdesk-${new Date().toISOString().slice(0,10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  if (!stats) {
    return <AppLayout><div className="animate-pulse text-center py-20 text-muted-foreground">Carregando relatórios...</div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="animate-fade-in">
        <div className="flex items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Relatórios</h2>
            <p className="text-sm text-muted-foreground mt-1">{stats.total} chamados no total</p>
          </div>
          <Button variant="outline" size="sm" className="gap-2" onClick={exportCSV}>
            <Download className="w-4 h-4" />Exportar CSV
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Chamados", value: stats.total, icon: BarChart3, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30" },
            { label: "Abertos", value: stats.byStatus.aberto, icon: TrendingUp, color: "text-blue-600 bg-blue-100" },
            { label: "Resolvidos", value: stats.byStatus.resolvido + stats.byStatus.fechado, icon: TrendingUp, color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30" },
            { label: "Urgentes", value: stats.byPriority.urgente, icon: TrendingUp, color: "text-red-600 bg-red-100 dark:bg-red-900/30" },
          ].map((c) => (
            <div key={c.label} className="p-4 rounded-xl bg-card border border-border/50">
              <div className="flex items-center gap-2 mb-2"><div className={`w-8 h-8 rounded-lg flex items-center justify-center ${c.color}`}><c.icon className="w-4 h-4"/></div></div>
              <div className="text-xl font-bold">{c.value}</div><div className="text-[11px] text-muted-foreground">{c.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Status Chart */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><PieChartIcon className="w-4 h-4"/>Chamados por Status</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart><Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({name, percent}) => `${name} ${(percent*100).toFixed(0)}%`}><Cell>{statusData.map((entry, idx) => <Cell key={idx} fill={entry.fill}/>)}</Cell></Pie><Tooltip/><Legend/></PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Priority Chart */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><BarChart3 className="w-4 h-4"/>Chamados por Prioridade</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 260)"/>
                  <XAxis dataKey="name" tick={{fontSize:12}}/>
                  <YAxis tick={{fontSize:12}}/>
                  <Tooltip/>
                  <Bar dataKey="value" radius={[6,6,0,0]}>{priorityData.map((e, i) => <Cell key={i} fill={e.fill}/>)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Department Chart */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Chamados por Departamento</CardTitle></CardHeader>
            <CardContent>
              {departmentData.length === 0 ? <p className="text-sm text-muted-foreground text-center py-10">Nenhum dado</p> : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={departmentData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 260)"/>
                    <XAxis type="number" tick={{fontSize:12}}/>
                    <YAxis type="category" dataKey="name" tick={{fontSize:12}} width={100}/>
                    <Tooltip/>
                    <Bar dataKey="value" radius={[0,6,6,0]}>{departmentData.map((e,i) => <Cell key={i} fill={e.fill||"#6366f1"}/>)}</Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Monthly Trend */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><Calendar className="w-4 h-4"/>Tendência Mensal</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={stats.byMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 260)"/>
                  <XAxis dataKey="month" tick={{fontSize:11}}/>
                  <YAxis tick={{fontSize:12}}/>
                  <Tooltip/>
                  <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} name="Total" dot={{r:4}}/>
                  <Line type="monotone" dataKey="resolvidos" stroke="#22c55e" strokeWidth={2} name="Resolvidos" dot={{r:4}}/>
                  <Legend/>
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Agent Performance */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Desempenho dos Agentes</CardTitle></CardHeader>
          <CardContent>
            {agentData.length === 0 ? <p className="text-sm text-muted-foreground text-center py-6">Nenhum dado de agente</p> : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={agentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 260)"/>
                  <XAxis dataKey="name" tick={{fontSize:12}}/>
                  <YAxis tick={{fontSize:12}}/>
                  <Tooltip/>
                  <Legend/>
                  <Bar dataKey="Atribuídos" fill="#3b82f6" radius={[4,4,0,0]}/>
                  <Bar dataKey="Resolvidos" fill="#22c55e" radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
