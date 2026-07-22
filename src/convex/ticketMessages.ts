import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Query: Listar mensagens de um ticket
export const listMessages = query({
  args: { ticketId: v.id("tickets") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) return [];

    // Verificar permissão
    if (ticket.createdBy !== user._id && user.role !== "admin") return [];

    const messages = await ctx.db
      .query("ticketMessages")
      .withIndex("by_ticketId", (q) => q.eq("ticketId", args.ticketId))
      .collect();

    messages.sort((a, b) => a._creationTime - b._creationTime);

    return messages;
  },
});

// Mutation: Adicionar mensagem a um ticket
export const addMessage = mutation({
  args: {
    ticketId: v.id("tickets"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Não autenticado");

    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) throw new Error("Ticket não encontrado");

    // Verificar permissão
    const isAdmin = user.role === "admin";
    const isOwner = ticket.createdBy === user._id;
    if (!isAdmin && !isOwner) throw new Error("Sem permissão");

    // Se o status é "aguardando_cliente" e quem responde é o cliente, voltar para "em_andamento"
    // Se o status é "aguardando_cliente" e quem responde é admin, manter
    const isFromAgent = isAdmin;

    const messageId = await ctx.db.insert("ticketMessages", {
      ticketId: args.ticketId,
      content: args.content,
      senderId: user._id,
      senderName: user.name || "Usuário",
      isFromAgent,
      isFromWhatsApp: false,
    });

    // Se o cliente respondeu quando estava "aguardando_cliente", voltar para "em_andamento"
    if (
      !isFromAgent &&
      ticket.status === "aguardando_cliente"
    ) {
      await ctx.db.patch(args.ticketId, { status: "em_andamento" });
      await ctx.db.insert("ticketMessages", {
        ticketId: args.ticketId,
        content: `Status alterado para "Em Andamento" - Cliente respondeu`,
        senderName: "Sistema",
        isFromAgent: false,
        isFromWhatsApp: false,
      });
    }

    return messageId;
  },
});

// Mutation: Enviar mensagem via WhatsApp
export const sendWhatsAppMessage = mutation({
  args: {
    ticketId: v.id("tickets"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") throw new Error("Sem permissão");

    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) throw new Error("Ticket não encontrado");
    if (!ticket.whatsappNumber) throw new Error("Cliente não possui WhatsApp cadastrado");

    // Registrar mensagem no sistema
    await ctx.db.insert("ticketMessages", {
      ticketId: args.ticketId,
      content: args.content,
      senderId: user._id,
      senderName: user.name || "Agente",
      isFromAgent: true,
      isFromWhatsApp: false,
    });

    // O envio real via Evolution API é feito pelo action
    return { sent: true, number: ticket.whatsappNumber };
  },
});
