import { index, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

/**
 * One row per Resource aggregate. Columns mirror the aggregate's value
 * objects flattened to primitives; closed-list codes are stored as text
 * (the domain owns the allowed values, the database just keeps them).
 */
export const resources = pgTable(
	'resources',
	{
		id: uuid('id').primaryKey(),
		title: text('title').notNull(),
		description: text('description').notNull(),
		category: text('category').notNull(),
		language: text('language').notNull(),
		provider: text('provider').notNull(),
		roles: text('roles').array().notNull(),
		fileKey: text('file_key').notNull(),
		fileOriginalName: text('file_original_name').notNull(),
		fileMimeType: text('file_mime_type').notNull(),
		fileSizeBytes: integer('file_size_bytes').notNull(),
		viewCount: integer('view_count').notNull().default(0),
		uploadedAt: timestamp('uploaded_at', { withTimezone: true }).notNull()
	},
	(table) => [
		// The list is always ordered by upload time, newest first.
		index('resources_uploaded_at_idx').on(table.uploadedAt)
	]
);

export type ResourceRow = typeof resources.$inferSelect;
export type NewResourceRow = typeof resources.$inferInsert;
