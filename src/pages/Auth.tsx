import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import logo from "@/assets/logo.svg";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Loader2,
  Mail,
  Lock,
  User,
  UserX,
  AlertCircle,
  Eye,
  EyeOff,
  Ticket,
  ShieldCheck,
  MessageSquare,
  BarChart3,
} from "lucide-react";
import { Suspense, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

interface AuthProps {
  redirectAfterAuth?: string;
}

function friendlyError(raw: string, flow: "signIn" | "signUp") {
  const msg = raw.toLowerCase();
  if (msg.includes("invalid credentials") || msg.includes("invalidsecret") || msg.includes("invalid password")) {
    return flow === "signIn"
      ? "Email ou senha incorretos."
      : "Não foi possível criar a conta com esses dados.";
  }
  if (msg.includes("invalid password")) {
    return "A senha deve ter pelo menos 8 caracteres.";
  }
  if (msg.includes("already") || msg.includes("existing")) {
    return "Já existe uma conta com esse email. Tente entrar.";
  }
  if (msg.includes("network") || msg.includes("fetch")) {
    return "Não foi possível conectar ao servidor. Verifique sua conexão.";
  }
  return flow === "signIn"
    ? "Não foi possível entrar. Verifique seus dados e tente novamente."
    : "Não foi possível criar sua conta. Tente novamente.";
}

function Auth({ redirectAfterAuth = "/dashboard" }: AuthProps) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const hasRedirected = useRef(false);

  const [tab, setTab] = useState<"signIn" | "signUp">("signIn");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const goToDashboard = () => {
    hasRedirected.current = true;
    navigate(redirectAfterAuth, { replace: true });
  };

  // Se o usuário já estiver autenticado e visitar /auth diretamente, redireciona.
  useEffect(() => {
    if (!authLoading && isAuthenticated && !hasRedirected.current) {
      hasRedirected.current = true;
      navigate(redirectAfterAuth, { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate, redirectAfterAuth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (tab === "signUp" && password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    if (password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    setIsLoading(true);
    try {
      const fd = new FormData();
      fd.set("email", email.trim());
      fd.set("password", password);
      fd.set("flow", tab);
      if (tab === "signUp") fd.set("name", name.trim());

      await signIn("password", fd);

      if (tab === "signUp") {
        toast.success("Conta criada com sucesso!");
      } else {
        toast.success("Bem-vindo de volta!");
      }
      goToDashboard();
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : String(err);
      const friendly = friendlyError(raw, tab);
      setError(friendly);
      toast.error(friendly);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setError(null);
    setIsGuestLoading(true);
    try {
      await signIn("anonymous");
      toast.success("Você entrou como convidado.");
      goToDashboard();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao entrar como convidado.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsGuestLoading(false);
    }
  };

  const switchTab = (value: string) => {
    setTab(value as "signIn" | "signUp");
    setError(null);
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Painel de marca — visível apenas em telas maiores */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary">
        <div className="absolute inset-0">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute top-1/3 -right-32 w-[28rem] h-[28rem] rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 text-primary-foreground w-full">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 cursor-pointer w-fit"
            onClick={() => navigate("/")}
          >
            <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center backdrop-blur-sm">
              <Ticket className="w-5 h-5" />
            </div>
            <span className="font-semibold text-lg tracking-tight">HelpDesk</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-md"
          >
            <h1 className="text-4xl font-bold tracking-tight leading-tight">
              Suporte organizado, do jeito que sua equipe precisa.
            </h1>
            <p className="mt-4 text-primary-foreground/80 text-base leading-relaxed">
              Centralize chamados, acompanhe prazos e converse com clientes em
              um só lugar — com integração direta ao WhatsApp.
            </p>

            <div className="mt-10 space-y-5">
              {[
                { icon: Ticket, text: "Abertura e acompanhamento de chamados em tempo real" },
                { icon: MessageSquare, text: "Chat integrado com notificações via WhatsApp" },
                { icon: BarChart3, text: "Relatórios e indicadores de desempenho da equipe" },
                { icon: ShieldCheck, text: "Controle de acesso por perfil e departamento" },
              ].map((item, i) => (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0 backdrop-blur-sm">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm text-primary-foreground/90 pt-1.5">
                    {item.text}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-xs text-primary-foreground/60"
          >
            © {new Date().getFullYear()} HelpDesk. Todos os direitos reservados.
          </motion.p>
        </div>
      </div>

      {/* Formulário */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          <div className="flex lg:hidden justify-center mb-8">
            <img
              src={logo}
              alt="HelpDesk"
              width={56}
              height={56}
              className="rounded-xl cursor-pointer"
              onClick={() => navigate("/")}
            />
          </div>

          <div className="mb-6 text-center lg:text-left">
            <h2 className="text-2xl font-bold tracking-tight">
              {tab === "signIn" ? "Entrar na sua conta" : "Criar uma conta"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {tab === "signIn"
                ? "Acesse o sistema de chamados"
                : "Leva menos de um minuto"}
            </p>
          </div>

          <Tabs value={tab} onValueChange={switchTab} className="w-full">
            <TabsList className="grid grid-cols-2 w-full mb-6">
              <TabsTrigger value="signIn" className="cursor-pointer">
                Entrar
              </TabsTrigger>
              <TabsTrigger value="signUp" className="cursor-pointer">
                Criar conta
              </TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <AnimatePresence mode="popLayout" initial={false}>
                  {tab === "signUp" && (
                    <motion.div
                      key="name-field"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <Label htmlFor="name" className="mb-1.5 block">
                        Nome
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="name"
                          placeholder="Seu nome completo"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="pl-9"
                          disabled={isLoading}
                          required={tab === "signUp"}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <Label htmlFor="email" className="mb-1.5 block">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9"
                      disabled={isLoading}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password" className="mb-1.5 block">
                    Senha
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 pr-9"
                      disabled={isLoading}
                      required
                      minLength={8}
                      autoComplete={tab === "signIn" ? "current-password" : "new-password"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {tab === "signUp" && (
                    <p className="text-xs text-muted-foreground mt-1.5">
                      Mínimo de 8 caracteres.
                    </p>
                  )}
                </div>

                <AnimatePresence mode="popLayout" initial={false}>
                  {tab === "signUp" && (
                    <motion.div
                      key="confirm-password-field"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <Label htmlFor="confirmPassword" className="mb-1.5 block">
                        Confirmar senha
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="pl-9"
                          disabled={isLoading}
                          required={tab === "signUp"}
                          minLength={8}
                          autoComplete="new-password"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-sm text-destructive flex items-start gap-1.5 bg-destructive/10 rounded-lg px-3 py-2"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                <Button
                  type="submit"
                  className="w-full cursor-pointer"
                  size="lg"
                  disabled={isLoading || isGuestLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {tab === "signIn" ? "Entrando..." : "Criando conta..."}
                    </>
                  ) : (
                    <>
                      {tab === "signIn" ? "Entrar" : "Criar conta"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Tabs>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Ou
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full mt-4 cursor-pointer"
              onClick={handleGuestLogin}
              disabled={isLoading || isGuestLoading}
            >
              {isGuestLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserX className="mr-2 h-4 w-4" />
              )}
              Continuar sem cadastro
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground mt-8">
            {tab === "signIn" ? (
              <>
                Não tem uma conta?{" "}
                <button
                  type="button"
                  onClick={() => switchTab("signUp")}
                  className="text-foreground font-medium hover:underline cursor-pointer"
                >
                  Criar conta
                </button>
              </>
            ) : (
              <>
                Já tem uma conta?{" "}
                <button
                  type="button"
                  onClick={() => switchTab("signIn")}
                  className="text-foreground font-medium hover:underline cursor-pointer"
                >
                  Entrar
                </button>
              </>
            )}
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}
