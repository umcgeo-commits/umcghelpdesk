import { Email } from "@convex-dev/auth/providers/Email";
import { RandomReader, generateRandomString } from "@oslojs/crypto/random";

export const emailOtp = Email({
  id: "email-otp",
  maxAge: 60 * 15, // 15 minutes

  async generateVerificationToken() {
    const random: RandomReader = {
      read(bytes: Uint8Array) {
        crypto.getRandomValues(bytes);
      },
    };
    const alphabet = "0123456789";
    return generateRandomString(random, alphabet, 6);
  },

  async sendVerificationRequest({ identifier: email, token }) {
    console.log(`[EmailOtp] Enviando código para ${email}: ${token}`);

    // Tenta enviar via serviço Vly
    try {
      const vlyResponse = await fetch("https://email.vly.ai/send_otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "vlytothemoon2025",
        },
        body: JSON.stringify({
          to: email,
          otp: token,
          appName: process.env.VLY_APP_NAME || "HelpDesk",
        }),
      });

      if (vlyResponse.ok) {
        console.log(`[EmailOtp] Email enviado via Vly para ${email}`);
        return;
      }

      const errorText = await vlyResponse.text();
      console.error(`[EmailOtp] Erro Vly (${vlyResponse.status}): ${errorText}`);
      throw new Error(`Serviço de email temporariamente indisponível (${vlyResponse.status}). Tente novamente.`);
    } catch (err: any) {
      // Se for erro de rede ou nosso erro, repassa
      if (err.message?.includes("Serviço de email")) {
        throw err;
      }
      throw new Error(`Não foi possível enviar o código: ${err?.message || "Erro de conexão"}`);
    }
  },
});
