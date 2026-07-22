import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const listDepartments = query({
  args: {},
  handler: async (ctx) => {
    const depts = await ctx.db.query("departments").collect();
    depts.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
    return depts;
  },
});

export const createDepartment = mutation({
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
    return await ctx.db.insert("departments", {
      name: args.name,
      description: args.description,
      color: args.color,
      icon: args.icon,
      order: args.order,
    });
  },
});

export const updateDepartment = mutation({
  args: {
    departmentId: v.id("departments"),
    name: v.string(),
    description: v.optional(v.string()),
    color: v.string(),
    icon: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") throw new Error("Sem permissão");
    await ctx.db.patch(args.departmentId, {
      name: args.name,
      description: args.description,
      color: args.color,
      icon: args.icon,
      order: args.order,
    });
  },
});

export const deleteDepartment = mutation({
  args: { departmentId: v.id("departments") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") throw new Error("Sem permissão");
    await ctx.db.delete(args.departmentId);
  },
});
