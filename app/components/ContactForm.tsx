'use client';

import { useState } from "react";

type FormState = {
	name: string;
	email: string;
	message: string;
};

export default function ContactForm() {
	const [form, setForm] = useState<FormState>({ name: "", email: "", message: "" });
	const [submitting, setSubmitting] = useState(false);
	const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setSubmitting(true);
		setResult(null);
		try {
			const res = await fetch("/api/contact", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(form),
			});
			const data = await res.json().catch(() => ({}));
			if (!res.ok) {
				throw new Error(data?.error || "Mesaj gönderilemedi");
			}
			setResult({ ok: true, message: "Mesajınız başarıyla gönderildi." });
			setForm({ name: "", email: "", message: "" });
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : "Mesaj gönderilemedi";
			setResult({ ok: false, message });
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<form onSubmit={onSubmit} className="space-y-4">
			<div className="grid gap-2">
				<label className="text-sm font-medium" htmlFor="name">İsim</label>
				<input
					id="name"
					type="text"
					required
					value={form.name}
					onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
					className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none ring-0 placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
					placeholder="Adınız"
				/>
			</div>
			<div className="grid gap-2">
				<label className="text-sm font-medium" htmlFor="email">Email</label>
				<input
					id="email"
					type="email"
					required
					value={form.email}
					onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
					className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none ring-0 placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
					placeholder="ornek@mail.com"
				/>
			</div>
			<div className="grid gap-2">
				<label className="text-sm font-medium" htmlFor="message">Mesaj</label>
				<textarea
					id="message"
					required
					rows={5}
					value={form.message}
					onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
					className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none ring-0 placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
					placeholder="Mesajınız"
				/>
			</div>
			<div className="flex items-center gap-3">
				<button
					type="submit"
					disabled={submitting}
					className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-white dark:text-black"
				>
					{submitting ? "Gönderiliyor..." : "Gönder"}
				</button>
				{result && (
					<p className={`text-sm ${result.ok ? "text-emerald-600" : "text-red-600"}`}>
						{result.message}
					</p>
				)}
			</div>
		</form>
	);
}


