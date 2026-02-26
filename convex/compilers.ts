import { v } from "convex/values";
import { query } from "./_generated/server";

export const get = query({
    args: {
        orgId: v.string(),
        search: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized.");

        const title = args.search as string;
        let compilers = [];

        if (title) {
            compilers = await ctx.db
                .query("compilers")
                .withSearchIndex("search_title", (q) =>
                    q.search("title", title).eq("orgId", args.orgId),
                )
                .collect();
        } else {
            compilers = await ctx.db
                .query("compilers")
                .withIndex("by_org", (q) => q.eq("orgId", args.orgId))
                .order("desc")
                .collect();
        }

        return compilers;
    },
});
