import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import { useAuth } from "@/hooks/use-auth";
import logo from "@/assets/logo.svg";
import { ArrowRight, Loader2, Mail, UserX, AlertCircle } from "lucide-react";
import { Suspense, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";

interface AuthProps {
  redirectAfterAuth?: string;
}

function Auth({ redirectAfterAuth = "/dashboard" }: AuthProps) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasRedirected = useRef(false);

  // Redireciona se já estiver autenticado (useEffect + flag pra evitar loops)
  useEffect(() => {
    if (!authLoading && isAuthenticated && !hasRedirected.current) {
      hasRedirected.current = true;
      navigate(redirectAfterAuth, { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate, redirectAfterAuth]);

  // Função auxiliar para navegar com fallback
  const goToDashboard = () => {
    hasRedirected.current = true;
    try {
      navigate(redirectAfterAuth, { replace: true });
    } catch {
      window.location.href = redirectAfterAuth;
    }
  };

  // Envia o código para o email
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Usa FormData (formato esperado pelo Email provider)
      const fd = new FormData();
      fd.set("email", email.trim());
      await signIn("email-otp", fd);

      setShowOtp(true);
      setOtp("");
      setError(null);
    } catch (err: any) {
      console.error("Erro ao enviar código:", err);
      // Mesmo com erro, o código pode ter sido enviado
      setShowOtp(true);
      setOtp("");
      setError(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Verifica o código
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;

    setIsLoading(true);
    setError(null);

    try {
      // Usa FormData com email + code
      const fd = new FormData();
      fd.set("email", email.trim());
      fd.set("code", otp);
      await signIn("email-otp", fd);

      // Sucesso! Navega imediatamente
      goToDashboard();
    } catch (err: any) {
      console.error("Erro na verificação:", err);

      const msg = err?.message || String(err) || "";

      // Verifica se mesmo com erro o usuário está autenticado
      if (isAuthenticated) {
        goToDashboard();
        return;
      }

      if (
        msg.toLowerCase().includes("expired") ||
        msg.toLowerCase().includes("invalid") ||
        msg.toLowerCase().includes("incorrect") ||
        msg.toLowerCase().includes("not found") ||
        msg.toLowerCase().includes("wrong")
      ) {
        setError("Código inválido ou expirado. Solicite um novo código.");
      } else if (
        msg.toLowerCase().includes("already") ||
        msg.toLowerCase().includes("signed in") ||
        msg.toLowerCase().includes("authenticated")
      ) {
        goToDashboard();
        return;
      } else {
        // Mostra o erro real para depuração
        setError(msg || "Não foi possível verificar o código. Tente novamente.");
      }

      setOtp("");
      setIsLoading(false);
    }
  };

  // Login anônimo
  const handleGuestLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await signIn("anonymous");
      // Verifica se autenticou
      if (isAuthenticated) {
        goToDashboard();
      }
      // O useEffect vai redirecionar se autenticar
    } catch (err: any) {
      console.error("Erro no login anônimo:", err);
      setError(err?.message || "Erro ao entrar como convidado");
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setShowOtp(false);
    setOtp("");
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center justify-center h-full flex-col">
          <Card className="min-w-[350px] pb-0 border shadow-sm">
            {!showOtp ? (
              <>
                <CardHeader className="text-center">
                  <div className="flex justify-center">
                    <img
                      src={logo}
                      alt="Logo"
                      width={64}
                      height={64}
                      className="rounded-lg mb-4 mt-4 cursor-pointer"
                      onClick={() => navigate("/")}
                    />
                  </div>
                  <CardTitle className="text-xl">Entrar</CardTitle>
                  <CardDescription>
                    Digite seu email para receber um código de verificação
                  </CardDescription>
                </CardHeader>

                <form onSubmit={handleSendCode}>
                  <CardContent>
                    <div className="relative flex items-center gap-2">
                      <div className="relative flex-1">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="seu@email.com"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-9"
                          disabled={isLoading}
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        variant="outline"
                        size="icon"
                        disabled={isLoading || !email.trim()}
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ArrowRight className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {error && (
                      <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {error}
                      </p>
                    )}

                    <div className="mt-4">
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
                        className="w-full mt-4"
                        onClick={handleGuestLogin}
                        disabled={isLoading}
                      >
                        <UserX className="mr-2 h-4 w-4" />
                        Continuar como Convidado
                      </Button>
                    </div>
                  </CardContent>
                </form>
              </>
            ) : (
              <>
                <CardHeader className="text-center mt-4">
                  <CardTitle>Verificar Código</CardTitle>
                  <CardDescription>
                    Enviamos um código de 6 dígitos para{" "}
                    <span className="font-medium text-foreground">{email}</span>
                  </CardDescription>
                </CardHeader>

                <form onSubmit={handleVerifyCode}>
                  <CardContent className="pb-4">
                    <div className="flex justify-center">
                      <InputOTP
                        value={otp}
                        onChange={setOtp}
                        maxLength={6}
                        disabled={isLoading}
                        autoFocus
                      >
                        <InputOTPGroup>
                          {Array.from({ length: 6 }).map((_, index) => (
                            <InputOTPSlot key={index} index={index} />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    </div>

                    {error && (
                      <p className="mt-2 text-sm text-red-500 text-center flex items-center justify-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {error}
                      </p>
                    )}

                    <p className="text-sm text-muted-foreground text-center mt-4">
                      Não recebeu o código?{" "}
                      <Button
                        type="button"
                        variant="link"
                        className="p-0 h-auto text-xs"
                        onClick={resetForm}
                      >
                        Tentar novamente
                      </Button>
                    </p>
                  </CardContent>

                  <CardFooter className="flex-col gap-2">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading || otp.length !== 6}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Entrando...
                        </>
                      ) : (
                        <>
                          Entrar
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={resetForm}
                      disabled={isLoading}
                      className="w-full"
                    >
                      Usar outro email
                    </Button>
                  </CardFooter>
                </form>
              </>
            )}

            <div className="py-4 px-6 text-xs text-center text-muted-foreground bg-muted border-t rounded-b-lg">
              Secured by{" "}
              <a
                href="https://freebuff.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-primary transition-colors"
              >
                freebuff.com
              </a>
            </div>
          </Card>
        </div>
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
