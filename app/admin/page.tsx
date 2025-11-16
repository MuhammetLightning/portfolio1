/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useState } from "react";

type Profile = {
  id: number;
  description: string | null;
  contactInfo: Record<string, unknown> | null;
  profileImageUrl: string | null;
  cvUrl: string | null;
};

type ProjectImage = { id: number; imageUrl: string };
type Project = { id: number; title: string; description: string | null; images: ProjectImage[] };

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile state
  const [profile, setProfile] = useState<Profile | null>(null);
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Projects state
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [editedProjects, setEditedProjects] = useState<Record<number, { title: string; description: string; dirty: boolean; saving: boolean; error?: string | null }>>({});

  useEffect(() => {
    const load = async () => {
      try {
        const [profileRes, projectsRes] = await Promise.all([
          fetch("/api/profile", { cache: "no-store" }),
          fetch("/api/projects", { cache: "no-store" }),
        ]);
        const profileJson = await profileRes.json();
        const projectsJson = await projectsRes.json();

        const p: Profile | null = profileJson.profile ?? null;
        setProfile(p);
        setDescription(p?.description ?? "");
        const contact = (p?.contactInfo ?? {}) as Record<string, unknown>;
        setEmail(typeof contact.email === "string" ? contact.email : "");
        setPhone(typeof contact.phone === "string" ? contact.phone : "");

        setProjects(Array.isArray(projectsJson.projects) ? projectsJson.projects : []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const contactInfo = useMemo(() => {
    const result: Record<string, string> = {};
    if (email) result.email = email;
    if (phone) result.phone = phone;
    return result;
  }, [email, phone]);

  async function uploadProfilePic(file: File) {
    const data = new FormData();
    data.append("file", file);
    const res = await fetch("/api/upload/profile-pic", { method: "POST", body: data });
    if (!res.ok) throw new Error("Upload failed");
    const json = await res.json();
    setProfile((prev) => (prev ? { ...prev, profileImageUrl: json.url } : prev));
  }

  async function uploadCv(file: File) {
    const data = new FormData();
    data.append("file", file);
    const res = await fetch("/api/upload/cv", { method: "POST", body: data });
    if (!res.ok) throw new Error("Upload failed");
    const json = await res.json();
    setProfile((prev) => (prev ? { ...prev, cvUrl: json.url } : prev));
  }

  async function saveProfile() {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, contactInfo }),
      });
      if (!res.ok) throw new Error("Save failed");
      const json = await res.json();
      setProfile(json.profile ?? null);
    } finally {
      setSaving(false);
    }
  }

  async function createProject() {
    if (!newProjectTitle.trim()) return;
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newProjectTitle.trim(), description: newProjectDescription || null }),
    });
    if (!res.ok) return;
    const json = await res.json();
    setProjects((prev) => [json.project, ...prev]);
    setNewProjectTitle("");
    setNewProjectDescription("");
  }

  async function updateProject(projectId: number, title: string, descriptionValue: string): Promise<boolean> {
    const res = await fetch(`/api/projects/${projectId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ title, description: descriptionValue || null }),
    });
    if (!res.ok) {
      let msg = "Güncelleme başarısız";
      try {
        const j = await res.json();
        if (j?.error) msg = String(j.error);
      } catch {}
      setEditedProjects((prev) => ({
        ...prev,
        [projectId]: { ...(prev[projectId] ?? { title, description: descriptionValue, dirty: true, saving: false }), saving: false, error: msg },
      }));
      return false;
    }
    const json = await res.json();
    setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, ...json.project } : p)));
    return true;
  }

  async function deleteProjectImage(imageId: number, projectId: number) {
    const res = await fetch(`/api/project-images/${imageId}`, { method: "DELETE" });
    if (!res.ok) return;
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, images: p.images.filter((img) => img.id !== imageId) } : p)),
    );
  }

  async function uploadProjectImages(projectId: number, files: FileList | null) {
    if (!files || files.length === 0) return;
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("projectId", String(projectId));
      fd.append("file", file);
      const res = await fetch("/api/upload/project-image", { method: "POST", body: fd });
      if (res.ok) {
        const json = await res.json();
        setProjects((prev) =>
          prev.map((p) => (p.id === projectId ? { ...p, images: [...p.images, json.image] } : p)),
        );
      }
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="text-zinc-600 dark:text-zinc-300">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-6 font-sans dark:bg-black">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-white">Admin Paneli</h1>
        <a
          href="/api/auth/signout?callbackUrl=/login"
          className="inline-flex items-center justify-center rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-black/90 focus:outline-none focus:ring-4 focus:ring-black/20 dark:bg-white dark:text-black dark:hover:bg-white/90 dark:focus:ring-white/20"
        >
          Çıkış yap
        </a>
      </header>

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2">
        <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold text-black dark:text-white">Profil Yönetimi</h2>

          <div className="mt-4 space-y-4">
            <div className="flex items-center gap-4">
              {profile?.profileImageUrl ? (
                <img
                  src={profile.profileImageUrl}
                  alt="Profil"
                  className="h-16 w-16 rounded-full object-cover ring-1 ring-black/10 dark:ring-white/10"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-zinc-200 dark:bg-zinc-800" />
              )}
              <label className="inline-flex cursor-pointer items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                <span>Profil resmi</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && uploadProfilePic(e.target.files[0])}
                />
              </label>
            </div>

            <div className="flex items-center gap-4">
              {profile?.cvUrl ? (
                <a
                  href={profile.cvUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="truncate text-sm text-blue-600 hover:underline dark:text-blue-400"
                >
                  Mevcut CV’yi görüntüle
                </a>
              ) : (
                <span className="text-sm text-zinc-500 dark:text-zinc-400">CV yüklenmemiş</span>
              )}
              <label className="inline-flex cursor-pointer items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                <span>CV</span>
                <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => e.target.files?.[0] && uploadCv(e.target.files[0])} />
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Yazı</label>
              <textarea
                className="mt-1 w-full rounded-lg border border-black/10 bg-white p-2 text-sm text-black outline-none ring-0 dark:border-white/10 dark:bg-zinc-800 dark:text-white"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</label>
                <input
                  className="mt-1 w-full rounded-lg border border-black/10 bg-white p-2 text-sm text-black outline-none ring-0 dark:border-white/10 dark:bg-zinc-800 dark:text-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Telefon</label>
                <input
                  className="mt-1 w-full rounded-lg border border-black/10 bg-white p-2 text-sm text-black outline-none ring-0 dark:border-white/10 dark:bg-zinc-800 dark:text-white"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+90 ..."
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={saveProfile}
                disabled={saving}
                className="inline-flex items-center justify-center rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-black/90 focus:outline-none focus:ring-4 focus:ring-black/20 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-white/90 dark:focus:ring-white/20"
              >
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold text-black dark:text-white">Proje Yönetimi</h2>

          <div className="mt-4 space-y-3 rounded-lg border border-black/10 p-4 dark:border-white/10">
            <h3 className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Yeni Proje Ekle</h3>
            <input
              className="w-full rounded-lg border border-black/10 bg-white p-2 text-sm text-black outline-none ring-0 dark:border-white/10 dark:bg-zinc-800 dark:text-white"
              placeholder="Başlık"
              value={newProjectTitle}
              onChange={(e) => setNewProjectTitle(e.target.value)}
            />
            <textarea
              className="w-full rounded-lg border border-black/10 bg-white p-2 text-sm text-black outline-none ring-0 dark:border-white/10 dark:bg-zinc-800 dark:text-white"
              placeholder="Açıklama"
              rows={3}
              value={newProjectDescription}
              onChange={(e) => setNewProjectDescription(e.target.value)}
            />
            <button
              onClick={createProject}
              className="inline-flex items-center justify-center rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-black/90 focus:outline-none focus:ring-4 focus:ring-black/20 dark:bg-white dark:text-black dark:hover:bg-white/90 dark:focus:ring-white/20"
            >
              Ekle
            </button>
          </div>

          <div className="mt-6 space-y-6">
            {projects.map((project) => (
              <div key={project.id} className="rounded-lg border border-black/10 p-4 dark:border-white/10">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">Başlık</label>
                    <input
                      className="w-full rounded-lg border border-black/10 bg-white p-2 text-sm text-black outline-none ring-0 dark:border-white/10 dark:bg-zinc-800 dark:text-white"
                      value={editedProjects[project.id]?.title ?? project.title}
                      onChange={(e) =>
                        setEditedProjects((prev) => ({
                          ...prev,
                          [project.id]: {
                            title: e.target.value,
                            description: prev[project.id]?.description ?? (project.description ?? ""),
                            dirty: true,
                            saving: prev[project.id]?.saving ?? false,
                          },
                        }))
                      }
                    />
                    <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">Açıklama</label>
                    <textarea
                      className="w-full rounded-lg border border-black/10 bg-white p-2 text-sm text-black outline-none ring-0 dark:border-white/10 dark:bg-zinc-800 dark:text-white"
                      value={editedProjects[project.id]?.description ?? (project.description ?? "")}
                      rows={3}
                      onChange={(e) =>
                        setEditedProjects((prev) => ({
                          ...prev,
                          [project.id]: {
                            title: prev[project.id]?.title ?? project.title,
                            description: e.target.value,
                            dirty: true,
                            saving: prev[project.id]?.saving ?? false,
                          },
                        }))
                      }
                    />
                    <div className="pt-1">
                      <button
                        onClick={async () => {
                          const draft = editedProjects[project.id] ?? {
                            title: project.title,
                            description: project.description ?? "",
                            dirty: false,
                            saving: false,
                          };
                          if (!draft.dirty || draft.saving) return;
                          setEditedProjects((prev) => ({
                            ...prev,
                            [project.id]: { ...draft, saving: true },
                          }));
                          const ok = await updateProject(project.id, draft.title, draft.description);
                          setEditedProjects((prev) => ({
                            ...prev,
                            [project.id]: {
                              ...draft,
                              dirty: ok ? false : true,
                              saving: false,
                              error: ok ? null : (prev[project.id]?.error ?? "Güncelleme başarısız"),
                            },
                          }));
                        }}
                        disabled={!(editedProjects[project.id]?.dirty) || !!editedProjects[project.id]?.saving}
                        className="inline-flex items-center justify-center rounded-lg bg-black px-3 py-2 text-xs font-medium text-white transition hover:bg-black/90 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-white/90"
                      >
                        {editedProjects[project.id]?.saving ? "Kaydediliyor..." : "Kaydet"}
                      </button>
                      {editedProjects[project.id]?.error ? (
                        <span className="ml-2 text-xs text-red-600">{editedProjects[project.id]?.error}</span>
                      ) : null}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Resimler</span>
                      <label className="text-xs text-blue-600 hover:underline dark:text-blue-400">
                        Yeni resim(ler) ekle
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => uploadProjectImages(project.id, e.target.files)}
                        />
                      </label>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {project.images.map((img) => (
                        <div key={img.id} className="group relative overflow-hidden rounded-md border border-black/10 dark:border-white/10">
                          <img src={img.imageUrl} alt="" className="h-24 w-full object-cover" />
                          <button
                            onClick={() => deleteProjectImage(img.id, project.id)}
                            className="absolute right-1 top-1 hidden rounded bg-red-600 px-2 py-1 text-xs text-white group-hover:block"
                          >
                            Sil
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

