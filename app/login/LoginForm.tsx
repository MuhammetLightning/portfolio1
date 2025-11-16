"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginForm() {
  const params = useSearchParams();
  const error = params.get("error") || undefined;
  const callbackUrl = params.get("callbackUrl") || "/admin";
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await signIn("credentials", {
        password,
        redirect: true,
        callbackUrl,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
          Giriş başarısız. Lütfen şifreyi kontrol edin.
        </div>
      )}

      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-black dark:text-white">
              Şifre
            </label>
            <Link
              href="#"
              className="text-xs font-medium text-zinc-700 underline-offset-2 hover:underline dark:text-zinc-300"
            >
              Şifreni mi unuttun?
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="block w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-black outline-none ring-0 transition placeholder:text-zinc-400 hover:border-black/20 focus:border-black/30 focus:ring-4 focus:ring-black/5 dark:border-white/10 dark:bg-zinc-900 dark:text-white dark:hover:border-white/20 dark:focus:border-white/30 dark:focus:ring-white/5"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-black/90 focus:outline-none focus:ring-4 focus:ring-black/20 disabled:opacity-70 dark:bg-white dark:text-black dark:hover:bg-white/90 dark:focus:ring-white/20"
        >
          {isSubmitting ? "Giriş yapılıyor..." : "Giriş yap"}
        </button>
      </form>
    </>
  );
}


