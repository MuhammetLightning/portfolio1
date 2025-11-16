import { pgTable, serial, text, integer, jsonb, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const profiles = pgTable('profiles', {
	id: serial('id').primaryKey(),
	profileImageUrl: text('profile_image_url'),
	description: text('description'),
	cvUrl: text('cv_url'),
	contactInfo: jsonb('contact_info'),
});

export const projects = pgTable('projects', {
	id: serial('id').primaryKey(),
	title: text('title').notNull(),
	description: text('description'),
});

export const projectImages = pgTable(
	'project_images',
	{
		id: serial('id').primaryKey(),
		imageUrl: text('image_url').notNull(),
		projectId: integer('project_id')
			.notNull()
			.references(() => projects.id, {
				onDelete: 'cascade',
				onUpdate: 'cascade',
			}),
	},
	(table) => ({
		projectIdIdx: index('project_images_project_id_idx').on(table.projectId),
	}),
);

export const projectsRelations = relations(projects, ({ many }) => ({
	images: many(projectImages),
}));

export const projectImagesRelations = relations(projectImages, ({ one }) => ({
	project: one(projects, {
		fields: [projectImages.projectId],
		references: [projects.id],
	}),
}));


