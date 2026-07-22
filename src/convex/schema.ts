import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
      role: v.optional(roleValidator),
      phone: v.optional(v.string()), // telefone do usuário
    }).index("email", ["email"]),

    // Categorias de tickets
    ticketCategories: defineTable({
      name: v.string(),
      description: v.optional(v.string()),
      color: v.string(),
      icon: v.optional(v.string()),
      order: v.optional(v.number()),
    }).index("by_name", ["name"]),

    // Tickets/chamados
    tickets: defineTable({
      title: v.string(),
      description: v.string(),
      status: v.union(
        v.literal("aberto"),
        v.literal("em_andamento"),
        v.literal("aguardando_cliente"),
        v.literal("resolvido"),
        v.literal("fechado"),
      ),
      priority: v.union(
        v.literal("baixa"),
        v.literal("media"),
        v.literal("alta"),
        v.literal("urgente"),
      ),
      categoryId: v.optional(v.id("ticketCategories")),
      createdBy: v.id("users"),
      assignedTo: v.optional(v.id("users")),
      whatsappNumber: v.optional(v.string()),
      whatsappInstance: v.optional(v.string()),
      closedAt: v.optional(v.number()),
      resolvedAt: v.optional(v.number()),
    })
      .index("by_createdBy", ["createdBy"])
      .index("by_assignedTo", ["assignedTo"])
      .index("by_status", ["status"])
      .index("by_priority", ["priority"]),

    // Mensagens dos tickets
    ticketMessages: defineTable({
      ticketId: v.id("tickets"),
      content: v.string(),
      senderId: v.optional(v.id("users")),
      senderName: v.string(),
      isFromAgent: v.boolean(),
      isFromWhatsApp: v.optional(v.boolean()),
      whatsappMessageId: v.optional(v.string()),
      attachmentUrl: v.optional(v.string()),
      attachmentName: v.optional(v.string()),
    })
      .index("by_ticketId", ["ticketId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
