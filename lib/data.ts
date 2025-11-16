import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles, projectImages, projects } from "@/db/schema";

export type PublicProfile = {
	id: number;
	profileImageUrl: string | null;
	description: string | null;
	cvUrl: string | null;
	contactInfo: Record<string, unknown> | null;
} | null;

export type PublicProject = {
	id: number;
	title: string;
	description: string | null;
	images: { id: number; imageUrl: string }[];
};

export async function getProfile(): Promise<PublicProfile> {
	const rows = await db.select().from(profiles).limit(1);
	const profile = rows[0] ?? null;
	if (!profile) return null;
	return {
		id: profile.id,
		profileImageUrl: profile.profileImageUrl ?? null,
		description: profile.description ?? null,
		cvUrl: profile.cvUrl ?? null,
		contactInfo: (profile.contactInfo as Record<string, unknown> | null) ?? null,
	};
}

export async function getProjects(): Promise<PublicProject[]> {
	const rows = await db
		.select()
		.from(projects)
		.leftJoin(projectImages, eq(projectImages.projectId, projects.id))
		.orderBy(desc(projects.id));

	const aggregated = new Map<number, PublicProject>();
	for (const row of rows) {
		const p = row.projects as typeof projects.$inferSelect;
		const img = (row.project_images ?? null) as typeof projectImages.$inferSelect | null;

		if (!aggregated.has(p.id)) {
			aggregated.set(p.id, {
				id: p.id,
				title: p.title,
				description: p.description ?? null,
				images: [],
			});
		}
		if (img) {
			aggregated.get(p.id)!.images.push({ id: img.id, imageUrl: img.imageUrl });
		}
	}
	return Array.from(aggregated.values());
}


