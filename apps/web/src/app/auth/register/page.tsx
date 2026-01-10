"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/utils/trpc";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    nickname: "",
  });
  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
    thirdParty: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: () => {
      setSuccessMessage("회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.");
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    },
    onError: (err) => {
      setErrors({ form: err.message || "회원가입에 실패했습니다." });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleAgreementChange = (key: keyof typeof agreements) => {
    setAgreements((prev) => ({ ...prev, [key]: !prev[key] }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = "계정명을 입력해주세요.";
    } else if (formData.username.length < 3) {
      newErrors.username = "계정명은 3자 이상이어야 합니다.";
    }

    if (!formData.password) {
      newErrors.password = "비밀번호를 입력해주세요.";
    } else if (formData.password.length < 6) {
      newErrors.password = "비밀번호는 6자 이상이어야 합니다.";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";
    }

    if (!formData.nickname.trim()) {
      newErrors.nickname = "닉네임을 입력해주세요.";
    }

    if (!agreements.terms) {
      newErrors.terms = "이용약관에 동의해야 합니다.";
    }

    if (!agreements.privacy) {
      newErrors.privacy = "개인정보 처리방침에 동의해야 합니다.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);

    if (validateForm()) {
      registerMutation.mutate({
        username: formData.username.trim(),
        password: formData.password,
        name: formData.nickname.trim(),
        thirdUse: agreements.thirdParty,
      });
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center px-4 py-8 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <h1 className="relative z-10 text-3xl font-bold text-primary mb-8 text-shadow-glow">
        삼국지 모의전투 HiDCHe
      </h1>

      <div className="premium-card w-full max-w-[600px] relative z-10">
        <div className="border-b border-white/10 px-4 py-4 mb-4 -mx-6 -mt-6 bg-black/20">
          <h2 className="text-xl font-bold text-primary/90 flex items-center gap-2">
            <span className="w-1 h-5 bg-primary rounded-full shadow-[0_0_10px_hsl(var(--primary))]"></span>
            회원가입
          </h2>
        </div>

        <div className="p-2">
          {successMessage && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300 text-sm backdrop-blur-sm shadow-[0_0_15px_rgba(16,185,129,0.1)] flex items-center gap-3">
              <span className="text-lg">✨</span>
              {successMessage}
            </div>
          )}
          {errors.form && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm backdrop-blur-sm shadow-[0_0_15px_rgba(239,68,68,0.1)] flex items-center gap-3">
              <span className="text-lg">⚠️</span>
              {errors.form}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 group">
              <label
                htmlFor="username"
                className="sm:w-[25%] text-sm font-medium text-muted-foreground sm:text-right group-focus-within:text-primary transition-colors"
              >
                계정명
              </label>
              <div className="sm:w-[75%]">
                <input
                  type="text"
                  id="username"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-lg text-white placeholder-white/20 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all duration-300 hover:bg-black/60"
                />
                {errors.username && (
                  <p className="mt-1 text-xs text-red-400 pl-1">{errors.username}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 group">
              <label
                htmlFor="password"
                className="sm:w-[25%] text-sm font-medium text-muted-foreground sm:text-right group-focus-within:text-primary transition-colors"
              >
                비밀번호
              </label>
              <div className="sm:w-[75%]">
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-lg text-white placeholder-white/20 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all duration-300 hover:bg-black/60"
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-400 pl-1">{errors.password}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 group">
              <label
                htmlFor="confirmPassword"
                className="sm:w-[25%] text-sm font-medium text-muted-foreground sm:text-right group-focus-within:text-primary transition-colors"
              >
                비밀번호 확인
              </label>
              <div className="sm:w-[75%]">
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-lg text-white placeholder-white/20 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all duration-300 hover:bg-black/60"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-400 pl-1">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 group">
              <label
                htmlFor="nickname"
                className="sm:w-[25%] text-sm font-medium text-muted-foreground sm:text-right pt-3 group-focus-within:text-primary transition-colors"
              >
                닉네임
              </label>
              <div className="sm:w-[75%]">
                <input
                  type="text"
                  id="nickname"
                  name="nickname"
                  placeholder="Nickname"
                  value={formData.nickname}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-lg text-white placeholder-white/20 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all duration-300 hover:bg-black/60"
                />
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed pl-1">
                  * 깃수가 종료될때 공개됩니다. 장수명과는 다르게 닉네임은 계속해서 고정되니
                  신중하게 정해주세요.
                </p>
                {errors.nickname && (
                  <p className="mt-1 text-xs text-red-400 pl-1">{errors.nickname}</p>
                )}
              </div>
            </div>

            <div className="my-6 border-t border-white/10"></div>

            <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
              <label className="sm:w-[25%] text-sm font-medium text-muted-foreground sm:text-right pt-2">
                이용 약관
              </label>
              <div className="sm:w-[75%]">
                <div className="bg-black/30 border border-white/10 rounded-lg p-4 max-h-32 overflow-y-auto text-sm text-gray-400 mb-2 custom-scrollbar">
                  본 서비스의 이용약관입니다. 서비스 이용에 관한 기본적인 사항을 규정합니다. 모든
                  이용자는 본 약관에 동의해야 서비스를 이용할 수 있습니다.
                </div>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-all duration-200 ${agreements.terms ? "bg-primary border-primary" : "bg-transparent border-white/30 group-hover:border-primary/50"}`}
                  >
                    <input
                      type="checkbox"
                      checked={agreements.terms}
                      onChange={() => handleAgreementChange("terms")}
                      className="hidden"
                    />
                    {agreements.terms && (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        className="text-black"
                      >
                        <path
                          d="M10 3L4.5 8.5L2 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <span
                    className={`text-sm transition-colors ${agreements.terms ? "text-white" : "text-gray-400 group-hover:text-gray-300"}`}
                  >
                    약관에 동의합니다.
                  </span>
                </label>
                {errors.terms && <p className="mt-1 text-xs text-red-400 pl-1">{errors.terms}</p>}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
              <label className="sm:w-[25%] text-sm font-medium text-muted-foreground sm:text-right pt-2">
                개인정보 제공
                <br />및 이용 동의
              </label>
              <div className="sm:w-[75%]">
                <div className="bg-black/30 border border-white/10 rounded-lg p-4 max-h-32 overflow-y-auto text-sm text-gray-400 mb-2 custom-scrollbar">
                  개인정보 수집 및 이용에 관한 동의입니다. 수집하는 개인정보 항목, 수집 목적, 보유
                  기간 등에 대해 안내합니다.
                </div>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-all duration-200 ${agreements.privacy ? "bg-primary border-primary" : "bg-transparent border-white/30 group-hover:border-primary/50"}`}
                  >
                    <input
                      type="checkbox"
                      checked={agreements.privacy}
                      onChange={() => handleAgreementChange("privacy")}
                      className="hidden"
                    />
                    {agreements.privacy && (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        className="text-black"
                      >
                        <path
                          d="M10 3L4.5 8.5L2 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <span
                    className={`text-sm transition-colors ${agreements.privacy ? "text-white" : "text-gray-400 group-hover:text-gray-300"}`}
                  >
                    개인정보 처리방침에 동의합니다.
                  </span>
                </label>
                {errors.privacy && (
                  <p className="mt-1 text-xs text-red-400 pl-1">{errors.privacy}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
              <label className="sm:w-[25%] text-sm font-medium text-muted-foreground sm:text-right pt-2">
                제3자 정보제공
                <br />
                <span className="text-xs opacity-70">(선택사항)</span>
              </label>
              <div className="sm:w-[75%]">
                <label className="flex items-center gap-3 cursor-pointer group pt-2">
                  <div
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-all duration-200 ${agreements.thirdParty ? "bg-primary border-primary" : "bg-transparent border-white/30 group-hover:border-primary/50"}`}
                  >
                    <input
                      type="checkbox"
                      checked={agreements.thirdParty}
                      onChange={() => handleAgreementChange("thirdParty")}
                      className="hidden"
                    />
                    {agreements.thirdParty && (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        className="text-black"
                      >
                        <path
                          d="M10 3L4.5 8.5L2 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <span
                    className={`text-sm transition-colors ${agreements.thirdParty ? "text-white" : "text-gray-400 group-hover:text-gray-300"}`}
                  >
                    제3자 정보 제공에 동의합니다.
                  </span>
                </label>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-6">
              <div className="sm:w-[25%]"></div>
              <div className="sm:w-[75%] space-y-4">
                <button
                  type="submit"
                  disabled={registerMutation.isPending || !!successMessage}
                  className="w-full btn-primary h-12 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {registerMutation.isPending ? "가입 처리중..." : "가입하기"}
                </button>
                <p className="text-center text-sm text-gray-400">
                  이미 계정이 있으신가요?{" "}
                  <Link
                    href="/auth/login"
                    className="text-primary hover:text-primary-glow hover:underline font-medium transition-colors"
                  >
                    로그인
                  </Link>
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
