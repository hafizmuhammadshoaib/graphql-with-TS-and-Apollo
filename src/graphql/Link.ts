import { Prisma } from "@prisma/client";
import {
  extendType,
  intArg,
  nonNull,
  objectType,
  stringArg,
  inputObjectType,
  enumType,
  arg,
  list,
} from "nexus";

export const Feed = objectType({
  name: "Feed",
  definition(t) {
    t.nonNull.list.nonNull.field("links", { type: Link }); // 1
    t.nonNull.int("count"); // 2
    t.id("id"); // 3
  },
});

export const LinkOrderByInput = inputObjectType({
  name: "LinkOrderByInput",
  definition(t) {
    t.field("description", { type: Sort });
    t.field("url", { type: Sort });
    t.field("createdAt", { type: Sort });
  },
});

export const Sort = enumType({
  name: "Sort",
  members: ["asc", "desc"],
});

export const Link = objectType({
  name: "Link",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.string("description");
    t.nonNull.string("url");
    t.nonNull.dateTime("createdAt");
    t.field("postedBy", {
      // 1
      type: "User",
      resolve(parent, args, context) {
        // 2
        return context.prisma.link
          .findUnique({ where: { id: parent.id } })
          .postedBy();
      },
    });
    t.nonNull.list.nonNull.field("voters", {
      // 1
      type: "User",
      resolve(parent, args, context) {
        return context.prisma.link
          .findUnique({ where: { id: parent.id } })
          .voters();
      },
    });
  },
});

export const LinkQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.field("feed", {
      // 1
      type: "Feed",
      args: {
        filter: stringArg(),
        skip: intArg(),
        take: intArg(),
        orderBy: arg({ type: list(nonNull(LinkOrderByInput)) }),
      },
      async resolve(parent, args, context) {
        const where = args.filter
          ? {
              OR: [
                { description: { contains: args.filter } },
                { url: { contains: args.filter } },
              ],
            }
          : {};

        const links = await context.prisma.link.findMany({
          where,
          skip: args?.skip as number | undefined,
          take: args?.take as number | undefined,
          orderBy: args?.orderBy as
            | Prisma.Enumerable<Prisma.LinkOrderByWithRelationInput>
            | undefined,
        });

        const count = await context.prisma.link.count({ where }); // 2
        const id = `main-feed:${JSON.stringify(args)}`; // 3

        return {
          // 4
          links,
          count,
          id,
        };
      },
    });
  },
});

export const LinkByIdQuery = extendType({
  // 2
  type: "Query",
  definition(t) {
    t.nonNull.field("link", {
      // 3
      type: "Link",
      args: {
        id: nonNull(intArg()),
      },
      async resolve(parent, args, context, info) {
        // 4
        const [link] = await context.prisma.link.findMany({
          where: { id: args.id },
        });
        return link;
      },
    });
  },
});

export const LinkMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("post", {
      type: "Link",
      args: {
        description: nonNull(stringArg()),
        url: nonNull(stringArg()),
      },
      resolve(parent, args, context) {
        const { description, url } = args;
        const { userId } = context;

        if (!userId) {
          // 1
          throw new Error("Cannot post without logging in.");
        }

        const newLink = context.prisma.link.create({
          data: {
            description,
            url,
            postedBy: { connect: { id: userId } }, // 2
          },
        });

        return newLink;
      },
    });
  },
});

export const UpdateLinkMutation = extendType({
  // 1
  type: "Mutation",
  definition(t) {
    t.nonNull.field("updateLink", {
      // 2
      type: "Link",
      args: {
        // 3
        id: nonNull(intArg()),
        description: nonNull(stringArg()),
        url: nonNull(stringArg()),
      },

      resolve(parent, args, context) {
        const { id: argsId, description, url } = args; // 4

        return context.prisma.link.update({
          where: { id: argsId },
          data: { description, url },
        });
      },
    });
  },
});

export const DeleteLinkMutation = extendType({
  // 1
  type: "Mutation",
  definition(t) {
    t.nonNull.field("deleteLink", {
      // 2
      type: "Link",
      args: {
        // 3
        id: nonNull(intArg()),
      },

      resolve(parent, args, context) {
        const { id: argsId } = args;

        return context.prisma.link.delete({ where: { id: argsId } });
      },
    });
  },
});
