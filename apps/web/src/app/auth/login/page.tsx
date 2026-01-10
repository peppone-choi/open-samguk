"use client";

import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center px-4 py-8">
      {/* Page Title */}
      <h1 className="text-3xl font-bold text-primary mb-8 tracking-wider font-serif">
        삼국지 모의전투 HiDCHe
      </h1>

      <LoginForm />
    </div>
  );
}
