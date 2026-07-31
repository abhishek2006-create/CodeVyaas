import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

export const createPlayground = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    template: v.string(),
  },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const playgroundId = await ctx.db.insert("playgrounds", {
      title: args.title,
      description: args.description,
      template: args.template,
      userId: identity.tokenIdentifier,
    });

    return playgroundId;
  },
});

export const getPlaygrounds = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const playgrounds = await ctx.db
      .query("playgrounds")
      .withIndex("by_user", (q) => q.eq("userId", identity.tokenIdentifier))
      .collect();

    return await Promise.all(
      playgrounds.map(async (playground) => {
        const star = await ctx.db
          .query("starMarks")
          .withIndex("by_user_playground", (q) =>
            q
              .eq("userId", identity.tokenIdentifier)
              .eq("playgroundId", playground._id),
          )
          .unique();

        return {
          ...playground,
          isMarked: !!star,
        };
      }),
    );
  },
});

export const getPlayground = query({
  args: {
    id: v.id("playgrounds"),
  },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const playground = await ctx.db.get(args.id);
    if (!playground) return null;
    if (playground.userId !== identity?.tokenIdentifier)
      throw new Error("Forbidden");
    const templateFiles = await ctx.db
      .query("templateFiles")
      .withIndex("by_playground", (q) => q.eq("playgroundId", args.id))
      .collect();

    return {
      ...playground,
      templateFiles,
    };
  },
});

export const deletePlayground = mutation({
  args: {
    id: v.id("playgrounds"),
  },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized!");
    }
    const playground = await ctx.db.get(args.id);
    if (!playground) throw new Error("Playground Not Found");
    if (playground.userId !== identity.tokenIdentifier)
      throw new Error("Forbidden to delete");
    await ctx.db.delete(args.id);
  },
});

export const updatePlayground = mutation({
  args: {
    id: v.id("playgrounds"),
    title: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized user!");

    const playground = await ctx.db.get(args.id);
    if (!playground) throw new Error("Playground Not Found");
    if (playground.userId !== identity.tokenIdentifier)
      throw new Error("Forbidden to update");

    await ctx.db.patch(args.id, {
      title: args.title,
      description: args.description,
    });
  },
});

export const saveUpdatedCode = mutation({
  args: {
    playgroundId: v.id("playgrounds"),
    content: v.string(),
  },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized user");

    const playground = await ctx.db.get(args.playgroundId);
    if (!playground) throw new Error("Playground Not Found!");

    const existing = await ctx.db
      .query("templateFiles")
      .withIndex("by_playground", (q) =>
        q.eq("playgroundId", args.playgroundId),
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        content: args.content,
      });

      return existing._id;
    }

    return await ctx.db.insert("templateFiles", {
      playgroundId: args.playgroundId,
      content: args.content,
    });
  },
});

export const duplicatePlayground = mutation({
  args: {
    id: v.id("playgrounds"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized!");
    }
    const playground = await ctx.db.get(args.id);
    if (!playground) throw new Error("Playground Not Found");

    if (playground.userId !== identity.tokenIdentifier)
      throw new Error("Forbidden to duplicate");

    const newPlaygroundId = await ctx.db.insert("playgrounds", {
      description: playground.description,
      title: `${playground.title}(Copy)`,
      template: playground.template,
      userId: identity.tokenIdentifier,
    });

    const TemplateFile = await ctx.db
      .query("templateFiles")
      .withIndex("by_playground", (q) => q.eq("playgroundId", args.id))
      .unique();

    if (TemplateFile) {
      await ctx.db.insert("templateFiles", {
        playgroundId: newPlaygroundId,
        content: TemplateFile.content,
      });
    }
    return newPlaygroundId;
  },
});

export const toggleStar = mutation({
  args: {
    playgroundId: v.id("playgrounds"),
    isMarked: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const existing = await ctx.db
      .query("starMarks")
      .withIndex("by_user_playground", (q) =>
        q
          .eq("userId", identity.tokenIdentifier)
          .eq("playgroundId", args.playgroundId),
      )
      .unique();

    if (args.isMarked) {
      if (!existing) {
        await ctx.db.insert("starMarks", {
          userId: identity.tokenIdentifier,
          playgroundId: args.playgroundId,
          isMarked: true,
        });
      }
    } else {
      if (existing) {
        await ctx.db.delete(existing._id);
      }
    }
    return {
      success: true,
      isMarked: args.isMarked,
    };
  },
});
