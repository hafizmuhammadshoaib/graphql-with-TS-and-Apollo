import { extendType, intArg, nonNull, objectType, stringArg } from "nexus";
import { NexusGenObjects } from "../../nexus-typegen";

export const Link = objectType({
  name: "Link", // <- Name of your type
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.string("description");
    t.nonNull.string("url");
  },
});

let links: NexusGenObjects["Link"][] = [
  // 1
  {
    id: 1,
    url: "www.howtographql.com",
    description: "Fullstack tutorial for GraphQL",
  },
  {
    id: 2,
    url: "graphql.org",
    description: "GraphQL official website",
  },
];

export const LinkQuery = extendType({
  // 2
  type: "Query",
  definition(t) {
    t.nonNull.list.nonNull.field("feed", {
      // 3
      type: "Link",
      resolve(parent, args, context, info) {
        // 4
        return links;
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
      resolve(parent, args, context, info) {
        // 4
        return links.find(({ id }) => id === args.id);
      },
    });
  },
});

export const LinkMutation = extendType({
  // 1
  type: "Mutation",
  definition(t) {
    t.nonNull.field("post", {
      // 2
      type: "Link",
      args: {
        // 3
        description: nonNull(stringArg()),
        url: nonNull(stringArg()),
      },

      resolve(parent, args, context) {
        const { description, url } = args; // 4

        let idCount = links.length + 1; // 5
        const link = {
          id: idCount,
          description: description,
          url: url,
        };
        links.push(link);
        return link;
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

        const link = {
          id: argsId,
          description: description,
          url: url,
        };
        const foundIndex = links.findIndex(({ id }) => id === argsId);
        links[foundIndex] = { ...link };
        return link;
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
        const { id: argsId } = args; // 4

        const foundIndex = links.findIndex(({ id }) => id === argsId);
        const [deletedLink] = links.splice(foundIndex, 1);
        return deletedLink;
      },
    });
  },
});
