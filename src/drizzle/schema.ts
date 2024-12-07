import { relations } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
	username: text('username', { length: 20 }).primaryKey(),
	password: text('password').notNull(),
	timestamp: integer('timestamp', { mode: 'timestamp_ms' })
		.$defaultFn(() => new Date())
		.notNull(),
});

export const posts = sqliteTable('posts', {
	id: text('id', { length: 36 })
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	content: text('content', { length: 10000 }).notNull(),
	timestamp: integer('timestamp', { mode: 'timestamp_ms' })
		.$defaultFn(() => new Date())
		.notNull(),
	author: text('author')
		.references(() => users.username, { onDelete: 'cascade' })
		.notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
	posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one }) => ({
	author: one(users, {
		fields: [posts.author],
		references: [users.username],
	}),
}));
