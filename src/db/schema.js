import { varchar } from "drizzle-orm/pg-core";
import { boolean } from "drizzle-orm/pg-core";
import { timestamp } from "drizzle-orm/pg-core";
import { uuid } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar({ length: 255 }),
    email: varchar({ length: 255 }).notNull().unique(),
    emailVerified: timestamp({ mode: 'date', precision: 3 }),
    emailVerificationSecret: varchar({ length: 255 }),
    password: varchar({ length: 255 }),
    image: varchar({ length: 255 }),
    provider: varchar({ length: 255 }),
    providerId: varchar({ length: 255 }),

    createdAt: timestamp({ mode: 'date', precision: 3 }).$default(() => new Date()),
    updatedAt: timestamp({ mode: 'date', precision: 3 }).$onUpdate(() => new Date()),
});

export const sessionsTable = pgTable("sessions", {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('userId').notNull(),
    device: varchar({ length: 255 }),
    ipAddress: varchar({ length: 255 }),
    expiresAt: timestamp({ mode: 'date', precision: 3 }).notNull(),

    createdAt: timestamp({ mode: 'date', precision: 3 }).$default(() => new Date()),
    updatedAt: timestamp({ mode: 'date', precision: 3 }).$onUpdate(() => new Date()),
})

export const projectsTable = pgTable("projects", {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar({ length: 255 }),
    ownerId: uuid('ownerId').notNull(),

    createdAt: timestamp({ mode: 'date', precision: 3 }).$default(() => new Date()),
    updatedAt: timestamp({ mode: 'date', precision: 3 }).$onUpdate(() => new Date()),
})

export const oauthProvidersTables = pgTable("oauth_providers", {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('projectId').notNull(),
    providerName: varchar({ length: 255 }).notNull(),
    clientId: varchar({ length: 255 }).notNull(),
    clientSecret: varchar({ length: 255 }).notNull(),
    isEnabled: boolean().default(false),

    createdAt: timestamp({ mode: 'date', precision: 3 }).$default(() => new Date()),
    updatedAt: timestamp({ mode: 'date', precision: 3 }).$onUpdate(() => new Date()),
})