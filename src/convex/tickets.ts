import { v } from "convex/values";
import { mutation, query, QueryCtx } from "./_generated/server";
import { getCurrentUser } from "./users";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Doc, Id } from "./_generated/dataModel";
import { api } from "./_generated/api";

// Tipos de status válidos
export const TICKET_STATUS = {
  ABERTO: "aberto",
  EM_ANDAMENTO: "em_andamento",
  AGUARDANDO_CLIENTE: "aguardando_cliente",
  RESOLVIDO: "resolvido",
  FECHADO: "fechado",
} as const;

export const TICKET_PRIORITY = {
  BAIXA: "baixa",
  MEDIA: "media",
  ALTA: "alta",
  URGENTE: "urgente",
} as const;

export const STATUS_TRANSITIONS: Record<string, string[]> = {
  aberto: ["em_andamento", "fechado"],
  em_andamento: ["aguardando_cliente", "resolvido", "fechado"],
  aguardando_cliente: ["em_andamento", "fechado"],
  resolvido: ["fechado"],
  fechado: ["aberto"], // reabrir
};

export const STATUS_LABELS: Record<string, string> = {
  aberto: "Aberto",
  em_andamento: "Em Andamento",
  aguardando_cliente: "Aguardando Cliente",
  resolvido: "Resolvido",
  fechado: "Fechado",
};

export const PRIORITY_LABELS: Record<string, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  urgente: "Urgente",
};

export const PRIORITY_ORDER: Record<string, number> = {
  baixa: 1,
  media: 2,
  alta: 3,
  urgente: 4,
};

// Query: Listar tickets do usuário atual
export const listMyTickets = query({
  args: {
    status: v.optional(v.string()),
    priority: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    let tickets = await ctx.db
      .query("tickets")
      .withIndex("by_createdBy", (q) => q.eq("createdBy", user._id))
      .collect();

    if (args.status) {
      tickets = tickets.filter((t) => t.status === args.status);
    }
    if (args.priority) {
      tickets = tickets.filter((t) => t.priority === args.priority);
    }
    if (args.search) {
      const search = args.search.toLowerCase();
      tickets = tickets.filter(
        (t) =>
          t.title.toLowerCase().includes(search) ||
          t.description.toLowerCase().includes(search)
      );
    }

    tickets.sort((a, b) => b._creationTime - a._creationTime);

    return Promise.all(
      tickets.map(async (ticket) => {
        const [category, department, service, assignee] = await Promise.all([
          ticket.categoryId ? ctx.db.get(ticket.categoryId) : null,
          ticket.departmentId ? ctx.db.get(ticket.departmentId) : null,
          ticket.serviceId ? ctx.db.get(ticket.serviceId) : null,
          ticket.assignedTo ? ctx.db.get(ticket.assignedTo) : null,
        ]);
        const messageCount = (
          await ctx.db
            .query("ticketMessages")
            .withIndex("by_ticketId", (q) => q.eq("ticketId", ticket._id))
            .collect()
        ).length;

        return {
          ...ticket,
          category,
          department: department ? { _id: department._id, name: department.name, color: department.color } : null,
          service: service ? { _id: service._id, name: service.name } : null,
          assignedTo: assignee
            ? { name: assignee.name, image: assignee.image }
            : null,
          messageCount,
        };
      })
    );
  },
});

// Query: Listar todos os tickets (admin)
export const listAllTickets = query({
  args: {
    status: v.optional(v.string()),
    priority: v.optional(v.string()),
    assignedTo: v.optional(v.id("users")),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") return [];

    let tickets = await ctx.db.query("tickets").collect();

    if (args.status) {
      tickets = tickets.filter((t) => t.status === args.status);
    }
    if (args.priority) {
      tickets = tickets.filter((t) => t.priority === args.priority);
    }
    if (args.assignedTo) {
      tickets = tickets.filter((t) => t.assignedTo === args.assignedTo);
    }
    if (args.search) {
      const search = args.search.toLowerCase();
      tickets = tickets.filter(
        (t) =>
          t.title.toLowerCase().includes(search) ||
          t.description.toLowerCase().includes(search)
      );
    }

    tickets.sort((a, b) => {
      const priorityDiff =
        PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b._creationTime - a._creationTime;
    });

    return Promise.all(
      tickets.map(async (ticket) => {
        const [category, department, service, creator, assignee] = await Promise.all([
          ticket.categoryId ? ctx.db.get(ticket.categoryId) : null,
          ticket.departmentId ? ctx.db.get(ticket.departmentId) : null,
          ticket.serviceId ? ctx.db.get(ticket.serviceId) : null,
          ctx.db.get(ticket.createdBy),
          ticket.assignedTo ? ctx.db.get(ticket.assignedTo) : null,
        ]);
        const messageCount = (
          await ctx.db
            .query("ticketMessages")
            .withIndex("by_ticketId", (q) => q.eq("ticketId", ticket._id))
            .collect()
        ).length;

        return {
          ...ticket,
          category,
          department: department ? { _id: department._id, name: department.name, color: department.color } : null,
          service: service ? { _id: service._id, name: service.name } : null,
          creator: creator
            ? { name: creator.name, image: creator.image, email: creator.email }
            : null,
          assignedTo: assignee
            ? { name: assignee.name, image: assignee.image }
            : null,
          messageCount,
        };
      })
    );
  },
});

// Query: Obter ticket por ID
export const getTicket = query({
  args: { ticketId: v.id("tickets") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) return null;

    if (ticket.createdBy !== user._id && user.role !== "admin") return null;

    const [category, department, service, creator, assignee] = await Promise.all([
      ticket.categoryId ? ctx.db.get(ticket.categoryId) : null,
      ticket.departmentId ? ctx.db.get(ticket.departmentId) : null,
      ticket.serviceId ? ctx.db.get(ticket.serviceId) : null,
      ctx.db.get(ticket.createdBy),
      ticket.assignedTo ? ctx.db.get(ticket.assignedTo) : null,
    ]);

    return {
      ...ticket,
      category,
      department: department ? { _id: department._id, name: department.name, color: department.color } : null,
      service: service ? { _id: service._id, name: service.name } : null,
      creator: creator
        ? { name: creator.name, image: creator.image, email: creator.email }
        : null,
      assignedTo: assignee
        ? {
            name: assignee.name,
            image: assignee.image,
            email: assignee.email,
          }
        : null,
    };
  },
});

// Query: Obter estatísticas dos tickets (admin)
export const getTicketStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") return null;

    const tickets = await ctx.db.query("tickets").collect();
    const usersCount = (await ctx.db.query("users").collect()).length;
    const depts = await ctx.db.query("departments").collect();

    const total = tickets.length;
    const abertos = tickets.filter((t) => t.status === "aberto").length;
    const emAndamento = tickets.filter((t) => t.status === "em_andamento").length;
    const aguardando = tickets.filter((t) => t.status === "aguardando_cliente").length;
    const resolvidos = tickets.filter((t) => t.status === "resolvido").length;
    const fechados = tickets.filter((t) => t.status === "fechado").length;
    const urgentes = tickets.filter((t) => t.priority === "urgente").length;

    return {
      total,
      abertos,
      emAndamento,
      aguardando,
      resolvidos,
      fechados,
      urgentes,
      totalUsuarios: usersCount,
      totalDepartamentos: depts.length,
    };
  },
});

// Mutation: Criar novo ticket
export const createTicket = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    priority: v.union(
      v.literal("baixa"),
      v.literal("media"),
      v.literal("alta"),
      v.literal("urgente")
    ),
    categoryId: v.optional(v.id("ticketCategories")),
    departmentId: v.optional(v.id("departments")),
    serviceId: v.optional(v.id("services")),
    whatsappNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Não autenticado");

    const ticketId = await ctx.db.insert("tickets", {
      title: args.title,
      description: args.description,
      status: "aberto",
      priority: args.priority,
      categoryId: args.categoryId,
      departmentId: args.departmentId,
      serviceId: args.serviceId,
      createdBy: userId,
      whatsappNumber: args.whatsappNumber,
    });

    await ctx.db.insert("ticketMessages", {
      ticketId,
      content: `Chamado #${ticketId.slice(0, 8)} aberto: ${args.title}`,
      senderName: "Sistema",
      isFromAgent: false,
      isFromWhatsApp: false,
    });

    return ticketId;
  },
});

// Query: Estatísticas detalhadas para relatórios
export const getReportStats = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") return null;

    let tickets = await ctx.db.query("tickets").collect();

    if (args.startDate) {
      tickets = tickets.filter((t) => t._creationTime >= args.startDate!);
    }
    if (args.endDate) {
      tickets = tickets.filter((t) => t._creationTime <= args.endDate!);
    }

    const total = tickets.length;

    // Por status
    const byStatus = {
      aberto: tickets.filter((t) => t.status === "aberto").length,
      em_andamento: tickets.filter((t) => t.status === "em_andamento").length,
      aguardando_cliente: tickets.filter((t) => t.status === "aguardando_cliente").length,
      resolvido: tickets.filter((t) => t.status === "resolvido").length,
      fechado: tickets.filter((t) => t.status === "fechado").length,
    };

    // Por prioridade
    const byPriority = {
      baixa: tickets.filter((t) => t.priority === "baixa").length,
      media: tickets.filter((t) => t.priority === "media").length,
      alta: tickets.filter((t) => t.priority === "alta").length,
      urgente: tickets.filter((t) => t.priority === "urgente").length,
    };

    // Por departamento
    const depts = await ctx.db.query("departments").collect();
    const byDepartment = await Promise.all(
      depts.map(async (d) => ({
        name: d.name,
        color: d.color,
        count: tickets.filter((t) => t.departmentId === d._id).length,
      }))
    );

    // Por agente (assignee)
    const agents = await ctx.db.query("users").collect();
    const byAgent = await Promise.all(
      agents
        .filter((a) => a.role === "admin" || a.role === "member")
        .map(async (a) => {
          const resolved = tickets.filter((t) => t.resolvedBy === a._id).length;
          const assigned = tickets.filter((t) => t.assignedTo === a._id).length;
          return {
            name: a.name || "Agente",
            email: a.email,
            assigned,
            resolved,
          };
        })
    );

    // Por mês (últimos 6 meses)
    const now = Date.now();
    const byMonth: { month: string; total: number; resolvidos: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now);
      d.setMonth(d.getMonth() - i);
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).getTime();
      const monthTickets = tickets.filter((t) => t._creationTime >= monthStart && t._creationTime <= monthEnd);
      byMonth.push({
        month: d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
        total: monthTickets.length,
        resolvidos: monthTickets.filter((t) => t.status === "resolvido" || t.status === "fechado").length,
      });
    }

    return {
      total,
      byStatus,
      byPriority,
      byDepartment: byDepartment.filter((d) => d.count > 0),
      byAgent: byAgent.filter((a) => a.assigned > 0 || a.resolved > 0),
      byMonth,
    };
  },
});

// Mutation: Atualizar status do ticket
export const updateTicketStatus = mutation({
  args: {
    ticketId: v.id("tickets"),
    newStatus: v.union(
      v.literal("aberto"),
      v.literal("em_andamento"),
      v.literal("aguardando_cliente"),
      v.literal("resolvido"),
      v.literal("fechado")
    ),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Não autenticado");

    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) throw new Error("Ticket não encontrado");

    const isAdmin = user.role === "admin";
    const isOwner = ticket.createdBy === user._id;

    if (!isAdmin && !isOwner) throw new Error("Sem permissão");

    const allowedTransitions = STATUS_TRANSITIONS[ticket.status] || [];
    if (!allowedTransitions.includes(args.newStatus)) {
      throw new Error(
        `Transição inválida: ${STATUS_LABELS[ticket.status]} → ${STATUS_LABELS[args.newStatus]}`
      );
    }

    const updateData: Partial<Doc<"tickets">> = {
      status: args.newStatus,
    };

    if (args.newStatus === "resolvido") {
      updateData.resolvedAt = Date.now();
      updateData.resolvedBy = user._id;
    }
    if (args.newStatus === "fechado") {
      updateData.closedAt = Date.now();
    }
    if (args.newStatus === "aberto" && ticket.status === "fechado") {
      updateData.closedAt = undefined;
      updateData.resolvedAt = undefined;
    }

    await ctx.db.patch(args.ticketId, updateData);

    const statusLabel = STATUS_LABELS[args.newStatus];
    await ctx.db.insert("ticketMessages", {
      ticketId: args.ticketId,
      content: `Status alterado para "${statusLabel}" por ${user.name || "Sistema"}`,
      senderName: "Sistema",
      isFromAgent: isAdmin,
      isFromWhatsApp: false,
    });
  },
});

// Mutation: Atribuir ticket a um agente
export const assignTicket = mutation({
  args: {
    ticketId: v.id("tickets"),
    agentId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") throw new Error("Sem permissão");

    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) throw new Error("Ticket não encontrado");

    const agent = await ctx.db.get(args.agentId);
    const agentName = agent?.name || "Agente";

    await ctx.db.patch(args.ticketId, {
      assignedTo: args.agentId,
    });

    await ctx.db.insert("ticketMessages", {
      ticketId: args.ticketId,
      content: `Chamado atribuído a ${agentName}`,
      senderName: "Sistema",
      isFromAgent: true,
      isFromWhatsApp: false,
    });
  },
});

// Mutation: Atualizar prioridade do ticket
export const updateTicketPriority = mutation({
  args: {
    ticketId: v.id("tickets"),
    priority: v.union(
      v.literal("baixa"),
      v.literal("media"),
      v.literal("alta"),
      v.literal("urgente")
    ),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") throw new Error("Sem permissão");

    await ctx.db.patch(args.ticketId, { priority: args.priority });

    const priorityLabel = PRIORITY_LABELS[args.priority];
    await ctx.db.insert("ticketMessages", {
      ticketId: args.ticketId,
      content: `Prioridade alterada para "${priorityLabel}" por ${user.name || "Admin"}`,
      senderName: "Sistema",
      isFromAgent: true,
      isFromWhatsApp: false,
    });
  },
});

// Query: Listar agentes disponíveis (admin)
export const listAgents = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") return [];

    const allUsers = await ctx.db.query("users").collect();
    return allUsers
      .filter((u) => u.role === "admin" || u.role === "member")
      .map((u) => ({
        _id: u._id,
        name: u.name,
        image: u.image,
        email: u.email,
      }));
  },
});
