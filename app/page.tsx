/* eslint-disable @next/next/no-img-element */
import ProjectSlider from "@/app/components/ProjectSlider";
import ContactForm from "@/app/components/ContactForm";
import { getProfile, getProjects } from "@/lib/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
	const profileData = await getProfile();
	const projectsData = await getProjects();

	const contactInfo = (profileData?.contactInfo as Record<string, unknown> | null) ?? null;
	const email = typeof contactInfo?.email === "string" ? (contactInfo.email as string) : null;
	const phone = typeof contactInfo?.phone === "string" ? (contactInfo.phone as string) : null;
	const linkedin = typeof contactInfo?.linkedin === "string" ? (contactInfo.linkedin as string) : null;

	return (
		<div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white px-6 py-12 font-sans dark:from-black dark:to-zinc-950">
			<main className="mx-auto grid w-full max-w-5xl gap-20">
				<section className="grid gap-6">
					<h1 className="text-4xl font-semibold tracking-tight text-black dark:text-zinc-50">
						Hakkımda
					</h1>
					<div className="rounded-2xl border border-black/10 bg-white/60 p-6 backdrop-blur md:p-8 dark:border-white/10 dark:bg-white/5">
						<div className="flex flex-col items-start gap-6 md:flex-row">
						{profileData?.profileImageUrl ? (
							<img
								src={profileData.profileImageUrl}
								alt="Profil"
								className="h-28 w-28 shrink-0 rounded-full object-cover ring-1 ring-black/10 md:h-32 md:w-32 dark:ring-white/10"
							/>
						) : null}
							<div className="grid gap-4">
								<p className="leading-relaxed text-zinc-700 md:text-lg dark:text-zinc-300">
									{profileData?.description ?? "Henüz bir açıklama eklenmedi."}
								</p>
								{profileData?.cvUrl ? (
									<a
										href="/api/download-cv"
										className="inline-flex w-fit items-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
									>
										CV İndir
									</a>
								) : null}
							</div>
						</div>
					</div>
				</section>

				<section className="grid gap-6">
					<h2 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
						Projelerim
					</h2>
					{projectsData.length === 0 ? (
						<div className="rounded-2xl border border-black/10 bg-white/60 p-6 text-zinc-700 backdrop-blur md:p-8 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
							Henüz proje eklenmedi.
						</div>
					) : (
						<div className="grid gap-10">
							{projectsData.map((project) => (
								<div
									key={project.id}
									className="rounded-2xl border border-black/10 bg-white/60 p-6 backdrop-blur md:p-8 dark:border-white/10 dark:bg-white/5"
								>
									<div className="grid gap-4">
										<h3 className="text-xl font-semibold text-black dark:text-zinc-50">
											{project.title}
										</h3>
										<ProjectSlider images={project.images.map((i) => i.imageUrl)} className="w-full" />
										{project.description ? (
											<p className="text-zinc-700 dark:text-zinc-300">{project.description}</p>
										) : null}
									</div>
								</div>
							))}
						</div>
					)}
				</section>

				<section id="contact" className="grid gap-6">
					<h2 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
						İletişim
					</h2>
					<div className="rounded-2xl border border-black/10 bg-white/60 p-6 backdrop-blur md:p-8 dark:border-white/10 dark:bg-white/5">
						<div className="grid gap-8 md:grid-cols-2">
							<div className="grid gap-4">
								{email ? (
									<a
										href={`mailto:${email}`}
										className="group flex items-center justify-between rounded-xl border border-black/10 bg-white/70 p-4 transition hover:bg-white/90 dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10"
									>
										<span className="flex items-center gap-3">
											<span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-sm font-medium text-black dark:bg-white/10 dark:text-zinc-100">
												@
											</span>
											<span className="grid">
												<span className="text-xs font-medium text-zinc-500 group-hover:text-zinc-700 dark:text-zinc-400 dark:group-hover:text-zinc-200">
													E-posta
												</span>
												<span className="truncate text-sm text-black dark:text-zinc-100">{email}</span>
											</span>
										</span>
										<span className="text-zinc-400 transition group-hover:text-zinc-600 dark:text-zinc-500 dark:group-hover:text-zinc-300">
											→
										</span>
									</a>
								) : null}
								{phone ? (
									<a
										href={`tel:${phone}`}
										className="group flex items-center justify-between rounded-xl border border-black/10 bg-white/70 p-4 transition hover:bg-white/90 dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10"
									>
										<span className="flex items-center gap-3">
											<span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-sm font-medium text-black dark:bg-white/10 dark:text-zinc-100">
												{/* phone icon */}☎
											</span>
											<span className="grid">
												<span className="text-xs font-medium text-zinc-500 group-hover:text-zinc-700 dark:text-zinc-400 dark:group-hover:text-zinc-200">
													Telefon
												</span>
												<span className="truncate text-sm text-black dark:text-zinc-100">{phone}</span>
											</span>
										</span>
										<span className="text-zinc-400 transition group-hover:text-zinc-600 dark:text-zinc-500 dark:group-hover:text-zinc-300">
											→
										</span>
									</a>
								) : null}
								{linkedin ? (
									<a
										href={linkedin}
										target="_blank"
										rel="noreferrer"
										className="group flex items-center justify-between rounded-xl border border-black/10 bg-white/70 p-4 transition hover:bg-white/90 dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10"
									>
										<span className="flex items-center gap-3">
											<span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-sm font-medium text-black dark:bg-white/10 dark:text-zinc-100">
												in
											</span>
											<span className="grid">
												<span className="text-xs font-medium text-zinc-500 group-hover:text-zinc-700 dark:text-zinc-400 dark:group-hover:text-zinc-200">
													LinkedIn
												</span>
												<span className="truncate text-sm text-black dark:text-zinc-100">{linkedin}</span>
											</span>
										</span>
										<span className="text-zinc-400 transition group-hover:text-zinc-600 dark:text-zinc-500 dark:group-hover:text-zinc-300">
											→
										</span>
									</a>
								) : null}
							</div>
							<div>
								<ContactForm />
							</div>
						</div>
					</div>
				</section>
			</main>
		</div>
	);
}
