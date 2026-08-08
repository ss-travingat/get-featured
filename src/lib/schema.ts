import { pgTable, serial, text, timestamp, index, integer, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  firstName: varchar('first_name', { length: 255 }),
  lastName: varchar('last_name', { length: 255 }),
  country: varchar('country', { length: 255 }),
  visitedCount: integer('visited_count'),
  links: text('links').array(), // Postgres array for links
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('users_email_idx').on(table.email)
]);

export const otps = pgTable('otps', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull(),
  otp: varchar('otp', { length: 10 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('otps_email_idx').on(table.email)
]);
