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
import { ArrowRight, Loader2, Mail, UserX, CheckCircle2 } from "lucide-react";
import { Suspense, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";

interface AuthProps {
  redirectAfterAuth?: string;
}

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<"signIn" | { email: string }>("signIn");
  const [otp, setOtp] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Redireciona se já estiver autenticado
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const redirect = redirectAfterAuth || "/";
      navigate(redirect, { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate, redirectAfterAuth]);

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const fd = new FormData();
      fd.set("email", emailInput);
      await signIn("email-otp", fd);
      setStep({ email: emailInput });
      setSuccessMsg(`Código enviado para ${emailInput}`);
    } catch (error) {
      console.error("Erro ao enviar código:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Falha ao enviar código de verificação. Tente novamente.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (otp.length !== 6) return;

    setIsLoading(true);
    setError(null);

    try {
      const email = typeof step === "object" ? step.email : emailInput;

      const fd = new FormData();
      fd.set("email", email);
      fd.set("code", otp);

      await signIn("email-otp", fd);

      // Se chegou aqui, o login foi bem-sucedido
      const redirect = redirectAfterAuth || "/dashboard";
      navigate(redirect, { replace: true });
    } catch (error) {
      console.error("Erro na verificação do código:", error);

      const errorMessage =
        error instanceof Error ? error.message : "";

      if (
        errorMessage.toLowerCase().includes("expired") ||
        errorMessage.toLowerCase().includes("invalid") ||
        errorMessage.toLowerCase().includes("incorrect") ||
        errorMessage.toLowerCase().includes("not found")
      ) {
        setError("Código inválido ou expirado. Solicite um novo código.");
      } else if (errorMessage.toLowerCase().includes("already")) {
        // Pode estar logado mesmo com erro
        const redirect = redirectAfterAuth || "/dashboard";
        navigate(redirect, { replace: true });
        return;
      } else {
        setError("Erro ao verificar código. Tente novamente.");
      }

      setOtp("");
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn("anonymous");
      const redirect = redirectAfterAuth || "/dashboard";
      navigate(redirect, { replace: true });
    } catch (error) {
      console.error("Erro no login anônimo:", error);
      setError(
        `Falha ao entrar como convidado: ${
          error instanceof Error ? error.message : "Erro desconhecido"
        }`,
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center justify-center h-full flex-col">
          <Card className="min-w-[350px] pb-0 border shadow-sm">
            {/* Step 1: Email Input */}
            {step === "signIn" ? (
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

                <form onSubmit={handleEmailSubmit}>
                  <CardContent>
                    <div className="relative flex items-center gap-2">
                      <div className="relative flex-1">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="seu@email.com"
                          type="email"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          className="pl-9"
                          disabled={isLoading}
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        variant="outline"
                        size="icon"
                        disabled={isLoading || !emailInput.trim()}
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ArrowRight className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {successMsg && (
                      <p className="mt-2 text-sm text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {successMsg}
                      </p>
                    )}
                    {error && (
                      <p className="mt-2 text-sm text-red-500">{error}</p>
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
              /* Step 2: OTP Verification */
              <>
                <CardHeader className="text-center mt-4">
                  <CardTitle>Verificar Código</CardTitle>
                  <CardDescription>
                    Enviamos um código de 6 dígitos para{" "}
                    <span className="font-medium text-foreground">
                      {typeof step === "object" ? step.email : ""}
                    </span>
                  </CardDescription>
                </CardHeader>

                <form onSubmit={handleOtpSubmit}>
                  <CardContent className="pb-4">
                    <div className="flex justify-center">
                      <InputOTP
                        value={otp}
                        onChange={setOtp}
                        maxLength={6}
                        disabled={isLoading}
                        autoFocus
                        onComplete={() => {
                          // Submete automaticamente quando os 6 dígitos forem preenchidos
                          const form = document.querySelector("#otp-form") as HTMLFormElement;
                          if (form) form.requestSubmit();
                        }}
                      >
                        <InputOTPGroup>
                          {Array.from({ length: 6 }).map((_, index) => (
                            <InputOTPSlot key={index} index={index} />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    </div>

                    {error && (
                      <p className="mt-2 text-sm text-red-500 text-center">
                        {error}
                      </p>
                    )}

                    <p className="text-sm text-muted-foreground text-center mt-4">
                      Não recebeu o código?{" "}
                      <Button
                        type="button"
                        variant="link"
                        className="p-0 h-auto text-xs"
                        onClick={() => {
                          setStep("signIn");
                          setOtp("");
                          setError(null);
                          setSuccessMsg(null);
                        }}
                      >
                        Tentar novamente
                      </Button>
                    </p>
                  </CardContent>

                  <CardFooter className="flex-col gap-2">
                    <Button
                      type="submit"
                      id="otp-form"
                      className="w-full"
                      disabled={isLoading || otp.length !== 6}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verificando...
                        </>
                      ) : (
                        <>
                          Verificar código
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setStep("signIn");
                        setOtp("");
                        setError(null);
                        setSuccessMsg(null);
                      }}
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
