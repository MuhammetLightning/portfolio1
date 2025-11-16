import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/db";
import { projectImages, projects } from "@/db/schema";

type CreateProjectRequest = {
	title: string;
	description?: string | null;
	images?: string[]; // array of image URLs
};

export async function GET() {
	const session = await getServerSession(authOptions);
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const rows = await db
		.select()
		.from(projects)
		.leftJoin(projectImages, eq(projectImages.projectId, projects.id))
		.orderBy(desc(projects.id));

	const aggregated = new Map<
		number,
		{ id: number; title: string; description: string | null; images: { id: number; imageUrl: string }[] }
	>();

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

	return NextResponse.json({ projects: Array.from(aggregated.values()) });
}

export async function POST(request: Request) {
	const session = await getServerSession(authOptions);
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	let payload: CreateProjectRequest;
	try {
		payload = await request.json();
	} catch {
		return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
	}

	if (!payload.title || typeof payload.title !== "string") {
		return NextResponse.json({ error: "title is required" }, { status: 400 });
	}

	const [createdProject] = await db
		.insert(projects)
		.values({
			title: payload.title,
			description: payload.description ?? null,
		})
		.returning();

	const imageUrls = Array.isArray(payload.images) ? payload.images.filter((u) => typeof u === "string" && u.length > 0) : [];
	if (imageUrls.length > 0) {
		await db.insert(projectImages).values(
			imageUrls.map((url) => ({
				imageUrl: url,
				projectId: createdProject.id,
			})),
		);
	}

	// Return created project with images
	const rows = await db
		.select()
		.from(projects)
		.leftJoin(projectImages, and(eq(projectImages.projectId, projects.id)))
		.where(eq(projects.id, createdProject.id));

	const images = rows
		.map((r) => r.project_images as typeof projectImages.$inferSelect | null)
		.filter((img): img is typeof projectImages.$inferSelect => img !== null)
		.map((img) => ({ id: img.id, imageUrl: img.imageUrl }));

	const result = {
		id: createdProject.id,
		title: createdProject.title,
		description: createdProject.description ?? null,
		images,
	};

	return NextResponse.json({ project: result }, { status: 201 });
}


