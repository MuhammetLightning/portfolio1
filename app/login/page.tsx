import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import LoginForm from "@/app/login/LoginForm";

export const metadata: Metadata = {
  title: "Giriş Yap",
  description: "Hesabınıza giriş yapın",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="w-full max-w-sm rounded-2xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-white">
            Giriş yap
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Hesabınıza erişmek için bilgilerinizi girin.
          </p>
        </div>

        <Suspense fallback={<div className="text-sm text-zinc-500 dark:text-zinc-400">Yükleniyor...</div>}>
          <LoginForm />
        </Suspense>

        <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Hesabın yok mu?{" "}
          <Link href="#" className="font-medium text-black underline-offset-2 hover:underline dark:text-white">
            Kaydol
          </Link>
        </p>
      </main>
    </div>
  );
}
