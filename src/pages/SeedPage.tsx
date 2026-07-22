import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Loader2, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function SeedPage() {
  const navigate = useNavigate();
  const seed = useMutation(api.seed.seedDatabase);
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSeed = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await seed();
      setResult(res);
      toast.success("Banco de dados populado com sucesso!");
    } catch (err: any) {
      const msg = err?.message || "Erro desconhecido";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Database className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Popular Banco de Dados</CardTitle>
          <CardDescription>
            Esta ação irá limpar todos os dados existentes e criar informações fictícias
            para teste do sistema HelpDesk.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!result && !error && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/30">
              <p className="text-sm text-amber-800 dark:text-amber-300 font-medium mb-1">⚠️ Atenção</p>
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Todos os dados existentes serão removidos antes de criar os novos dados.
                Esta operação não pode ser desfeita.
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200/50 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-300">Erro</p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>
                <p className="text-xs text-red-500 dark:text-red-400 mt-2">
                  Dica: Faça login primeiro em <button onClick={() => navigate("/auth")} className="underline font-medium">/auth</button>{" "}
                  clicando em "Continuar sem cadastro".
                </p>
              </div>
            </div>
          )}

          {result && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                  {result.message}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {result.stats && (
                  <>
                    <div className="p-2 rounded-lg bg-emerald-100/50 dark:bg-emerald-900/20">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">{result.stats.departments}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 ml-1">Departamentos</span>
                    </div>
                    <div className="p-2 rounded-lg bg-emerald-100/50 dark:bg-emerald-900/20">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">{result.stats.services}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 ml-1">Serviços</span>
                    </div>
                    <div className="p-2 rounded-lg bg-emerald-100/50 dark:bg-emerald-900/20">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">{result.stats.categories}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 ml-1">Categorias</span>
                    </div>
                    <div className="p-2 rounded-lg bg-emerald-100/50 dark:bg-emerald-900/20">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">{result.stats.tickets}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 ml-1">Chamados</span>
                    </div>
                  </>
                )}
              </div>
              {result.stats?.adminEmail && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-3">
                  ✅ Admin configurado: <strong>{result.stats.adminEmail}</strong>
                </p>
              )}
              <div className="flex gap-2 mt-4">
                <Button size="sm" onClick={() => navigate("/dashboard")} className="gap-1">
                  Ver Chamados <ArrowRight className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => navigate("/admin")} className="gap-1">
                  Painel Admin <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}

          <Button
            onClick={handleSeed}
            disabled={isLoading || !!result}
            className="w-full gap-2"
            size="lg"
          >
            {isLoading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Populando...</>
            ) : result ? (
              <><CheckCircle2 className="w-5 h-5" /> Banco populado com sucesso</>
            ) : (
              <><Database className="w-5 h-5" /> Popular Banco de Dados</>
            )}
          </Button>

          <div className="text-center">
            <button
              onClick={() => navigate("/auth")}
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              Ir para Login
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
