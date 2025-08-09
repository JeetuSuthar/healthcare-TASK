import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import gql from 'graphql-tag';
import { prisma } from '@/lib/db';

const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    firstName: String!
    lastName: String!
    role: String!
    shifts: [Shift!]
  }

  type Shift {
    id: ID!
    user: User!
    clockInTime: String!
    clockOutTime: String
    clockInLatitude: Float!
    clockInLongitude: Float!
    clockOutLatitude: Float
    clockOutLongitude: Float
    clockInNote: String
    clockOutNote: String
  }

  type LocationPerimeter {
    id: ID!
    name: String!
    latitude: Float!
    longitude: Float!
    radius: Int!
    isActive: Boolean!
    createdBy: String!
  }

  type Query {
    users: [User!]
    user(id: ID!): User
    shifts: [Shift!]
    shift(id: ID!): Shift
    locationPerimeters: [LocationPerimeter!]
    activePerimeter: LocationPerimeter
  }
`;

const resolvers = {
  Query: {
    users: async () => prisma.user.findMany(),
    user: async (_: any, { id }: { id: string }) => prisma.user.findUnique({ where: { id } }),
    shifts: async () => prisma.shift.findMany(),
    shift: async (_: any, { id }: { id: string }) => prisma.shift.findUnique({ where: { id } }),
    locationPerimeters: async () => prisma.locationPerimeter.findMany(),
    activePerimeter: async () => prisma.locationPerimeter.findFirst({ where: { isActive: true } }),
  },
  User: {
    shifts: (parent: any) => prisma.shift.findMany({ where: { userId: parent.id } }),
  },
  Shift: {
    user: (parent: any) => prisma.user.findUnique({ where: { id: parent.userId } }),
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

export const GET = startServerAndCreateNextHandler(server);
export const POST = startServerAndCreateNextHandler(server);
