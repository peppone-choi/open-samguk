"use client";

import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center px-4 py-8 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 text-center mb-10">
        <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-primary via-primary/80 to-primary/50 tracking-widest font-serif mb-2 drop-shadow-sm">
          삼국지 모의전투
        </h1>
        <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-primary/50 to-transparent mb-2" />
        <p className="text-xl md:text-2xl font-light text-primary/80 tracking-[0.5em] uppercase">
          HiDCHe
        </p>
      </div>

      <div className="relative z-10 w-full flex justify-center">
        <LoginForm />
      </div>
    </div>
  );
}
