import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

/**
 * Action para enviar mensagem via Evolution API
 * O usuário precisa ter a Evolution API rodando e configurar as env vars:
 * - EVOLUTION_API_URL: URL da Evolution API (ex: https://evo.mydomain.com)
 * - EVOLUTION_API_KEY: Chave de API da Evolution
 * - EVOLUTION_INSTANCE_NAME: Nome da instância
 */
export const sendWhatsApp = action({
  args: {
    to: v.string(), // número com DDI + DDD + número (ex: 5511999999999)
    text: v.string(), // texto da mensagem
    instanceName: v.optional(v.string()), // nome da instância (opcional, usa default)
  },
  handler: async (_, args) => {
    const apiUrl = process.env.EVOLUTION_API_URL;
    const apiKey = process.env.EVOLUTION_API_KEY;
    const instance = args.instanceName || process.env.EVOLUTION_INSTANCE_NAME || "default";

    if (!apiUrl || !apiKey) {
      throw new Error(
        "Evolution API não configurada. Configure EVOLUTION_API_URL e EVOLUTION_API_KEY"
      );
    }

    const response = await fetch(
      `${apiUrl}/message/sendText/${instance}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": apiKey,
        },
        body: JSON.stringify({
          number: args.to,
          text: args.text,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro Evolution API: ${response.status} - ${errorText}`);
    }

    return await response.json();
  },
});

/**
 * Action para enviar notificação de novo chamado via WhatsApp
 */
export const notifyNewTicketWhatsApp = action({
  args: {
    ticketId: v.id("tickets"),
    to: v.string(),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const message = `📋 *Novo Chamado #${args.ticketId.slice(0, 8)}*\n\n` +
      `*Título:* ${args.title}\n` +
      `*Status:* Aberto\n\n` +
      `Seu chamado foi registrado com sucesso! Em breve nossa equipe entrará em contato.`;

    try {
      await ctx.runAction(api.whatsapp.sendWhatsApp, {
        to: args.to,
        text: message,
      });
      return { sent: true };
    } catch (error) {
      console.error("Erro ao enviar WhatsApp:", error);
      return { sent: false, error: String(error) };
    }
  },
});

/**
 * Action para notificar atualização de status via WhatsApp
 */
export const notifyStatusUpdateWhatsApp = action({
  args: {
    ticketId: v.id("tickets"),
    to: v.string(),
    title: v.string(),
    newStatus: v.string(),
  },
  handler: async (ctx, args) => {
    const statusLabels: Record<string, string> = {
      aberto: "Aberto",
      em_andamento: "Em Andamento",
      aguardando_cliente: "Aguardando sua resposta",
      resolvido: "Resolvido ✅",
      fechado: "Fechado",
    };

    const statusMsg = statusLabels[args.newStatus] || args.newStatus;

    const message = `📌 *Atualização de Chamado #${args.ticketId.slice(0, 8)}*\n\n` +
      `*Título:* ${args.title}\n` +
      `*Novo Status:* ${statusMsg}\n\n` +
      `Acesse o portal para mais detalhes.`;

    try {
      await ctx.runAction(api.whatsapp.sendWhatsApp, {
        to: args.to,
        text: message,
      });
      return { sent: true };
    } catch (error) {
      console.error("Erro ao enviar WhatsApp:", error);
      return { sent: false, error: String(error) };
    }
  },
});

/**
 * Action para enviar mensagem de chat via WhatsApp
 */
export const sendChatMessageWhatsApp = action({
  args: {
    ticketId: v.id("tickets"),
    to: v.string(),
    message: v.string(),
    agentName: v.string(),
  },
  handler: async (ctx, args) => {
    const text = `💬 *${args.agentName} (Suporte)*\n\n${args.message}\n\n` +
      `_Responda diretamente neste chat ou acesse o portal._`;

    try {
      await ctx.runAction(api.whatsapp.sendWhatsApp, {
        to: args.to,
        text,
      });
      return { sent: true };
    } catch (error) {
      console.error("Erro ao enviar WhatsApp:", error);
      return { sent: false, error: String(error) };
    }
  },
});
