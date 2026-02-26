import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const images = [
    "/placeholders/1.svg",
    "/placeholders/2.svg",
    "/placeholders/3.svg",
    "/placeholders/4.svg",
    "/placeholders/5.svg",
    "/placeholders/6.svg",
    "/placeholders/7.svg",
    "/placeholders/8.svg",
    "/placeholders/9.svg",
    "/placeholders/10.svg",
];

export const create = mutation({
    args: {
        orgId: v.string(),
        title: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized.");

        const randomImage = images[Math.floor(Math.random() * images.length)];

        const compiler = await ctx.db.insert("compilers", {
            title: args.title,
            orgId: args.orgId,
            authorId: identity.subject,
            authorName: identity.name!,
            imageUrl: randomImage,
        });

        return compiler;
    },
});

export const remove = mutation({
    args: { id: v.id("compilers") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized.");
        await ctx.db.delete(args.id);
    },
});

export const update = mutation({
    args: { id: v.id("compilers"), title: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized.");

        const title = args.title.trim();
        if (!title) throw new Error("Title is required.");
        if (title.length > 60) throw new Error("Title cannot be longer than 60 characters.");

        const compiler = await ctx.db.patch(args.id, { title: args.title });
        return compiler;
    },
});

export const get = query({
    args: { id: v.id("compilers") },
    handler: async (ctx, args) => {
        return ctx.db.get(args.id);
    },
});
