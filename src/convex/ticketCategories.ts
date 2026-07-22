import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Query: Listar todas as categorias
export const listCategories = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db.query("ticketCategories").collect();
    categories.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
    return categories;
  },
});

// Mutation: Criar categoria (admin)
export const createCategory = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    color: v.string(),
    icon: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") throw new Error("Sem permissão");

    return await ctx.db.insert("ticketCategories", {
      name: args.name,
      description: args.description,
      color: args.color,
      icon: args.icon,
      order: args.order,
    });
  },
});

// Mutation: Remover categoria (admin)
export const deleteCategory = mutation({
  args: { categoryId: v.id("ticketCategories") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") throw new Error("Sem permissão");

    await ctx.db.delete(args.categoryId);
  },
});
