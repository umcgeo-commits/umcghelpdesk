import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";
import { Id } from "./_generated/dataModel";

export const listServices = query({
  args: {
    departmentId: v.optional(v.id("departments")),
  },
  handler: async (ctx, args) => {
    let services;
    if (args.departmentId) {
      services = await ctx.db
        .query("services")
        .withIndex("by_department", (q) => q.eq("departmentId", args.departmentId!))
        .collect();
    } else {
      services = await ctx.db.query("services").collect();
    }

    return Promise.all(
      services.map(async (svc) => {
        const department = await ctx.db.get(svc.departmentId);
        return { ...svc, department: department ? { name: department.name, color: department.color } : null };
      })
    );
  },
});

export const createService = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    departmentId: v.id("departments"),
    color: v.optional(v.string()),
    sla_hours: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") throw new Error("Sem permissão");
    return await ctx.db.insert("services", {
      name: args.name,
      description: args.description,
      departmentId: args.departmentId,
      color: args.color,
      sla_hours: args.sla_hours,
    });
  },
});

export const updateService = mutation({
  args: {
    serviceId: v.id("services"),
    name: v.string(),
    description: v.optional(v.string()),
    departmentId: v.id("departments"),
    color: v.optional(v.string()),
    sla_hours: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") throw new Error("Sem permissão");
    await ctx.db.patch(args.serviceId, {
      name: args.name,
      description: args.description,
      departmentId: args.departmentId,
      color: args.color,
      sla_hours: args.sla_hours,
    });
  },
});

export const deleteService = mutation({
  args: { serviceId: v.id("services") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "admin") throw new Error("Sem permissão");
    await ctx.db.delete(args.serviceId);
  },
});
