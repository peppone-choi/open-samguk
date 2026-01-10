"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { trpc } from "@/utils/trpc";

type Step = "username" | "otp" | "newPassword" | "success";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("username");
  const [username, setUsername] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState<string | null>(null); // For development mode

  const requestResetMutation = trpc.auth.requestPasswordReset.useMutation({
    onSuccess: (data) => {
      if (data.otp) {
        // Development mode - show OTP for testing
        setDevOtp(data.otp);
      }
      setStep("otp");
      setError(null);
    },
    onError: (err) => {
      setError(err.message || "비밀번호 재설정 요청에 실패했습니다.");
    },
  });

  const resetPasswordMutation = trpc.auth.resetPassword.useMutation({
    onSuccess: () => {
      setStep("success");
      setError(null);
    },
    onError: (err) => {
      setError(err.message || "비밀번호 재설정에 실패했습니다.");
    },
  });

  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError("계정명을 입력해주세요.");
      return;
    }

    requestResetMutation.mutate({ username: username.trim() });
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!otp.trim() || otp.length !== 4) {
      setError("4자리 인증 코드를 입력해주세요.");
      return;
    }

    setStep("newPassword");
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newPassword || newPassword.length < 6) {
      setError("비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    resetPasswordMutation.mutate({
      username: username.trim(),
      otp: otp.trim(),
      newPassword,
    });
  };

  const handleGoToLogin = () => {
    router.push("/auth/login");
  };

  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center px-4 py-8">
      {/* Page Title */}
      <h1 className="text-3xl font-bold text-primary mb-8">삼국지 모의전투 HiDCHe</h1>

      {/* Reset Password Card */}
      <div className="w-full max-w-[450px] bg-zinc-800 border border-gray-600 rounded-lg overflow-hidden">
        {/* Card Header */}
        <div className="bg-zinc-900 border-b border-gray-600 px-4 py-3 flex items-center gap-2">
          {step !== "success" && (
            <Link
              href="/auth/login"
              className="text-gray-400 hover:text-white transition-colors"
              title="로그인으로 돌아가기"
            >
              <ArrowLeft size={20} />
            </Link>
          )}
          <h2 className="text-lg font-semibold text-white">비밀번호 초기화</h2>
        </div>

        {/* Card Body */}
        <div className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded text-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Enter Username */}
          {step === "username" && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <p className="text-sm text-gray-400 mb-4">
                비밀번호를 초기화할 계정명을 입력해주세요. 인증 코드가 발송됩니다.
              </p>

              <div className="flex items-center gap-4">
                <label htmlFor="username" className="w-[35%] text-sm text-gray-300 text-right">
                  계정명
                </label>
                <div className="w-[65%]">
                  <input
                    type="text"
                    id="username"
                    name="username"
                    autoComplete="username"
                    placeholder="계정명"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoFocus
                    className="w-full px-3 py-2 bg-zinc-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={requestResetMutation.isPending}
                  className="px-6 py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-amber-800 disabled:cursor-not-allowed text-white font-semibold rounded transition-colors"
                >
                  {requestResetMutation.isPending ? "요청 중..." : "인증 코드 요청"}
                </button>
              </div>
            </form>
          )}

          {/* Step 2: Enter OTP */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <p className="text-sm text-gray-400 mb-4">
                인증 코드 4자리를 입력해주세요. (3분 이내)
              </p>

              {/* Dev mode: Show OTP */}
              {devOtp && (
                <div className="mb-4 p-3 bg-blue-900/50 border border-blue-700 rounded text-blue-200 text-sm">
                  <strong>[개발 모드]</strong> 인증 코드:{" "}
                  <code className="bg-blue-800 px-2 py-1 rounded">{devOtp}</code>
                </div>
              )}

              <div className="flex items-center gap-4">
                <label htmlFor="otp" className="w-[35%] text-sm text-gray-300 text-right">
                  인증 코드
                </label>
                <div className="w-[65%]">
                  <input
                    type="text"
                    id="otp"
                    name="otp"
                    maxLength={4}
                    placeholder="0000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    autoFocus
                    className="w-full px-3 py-2 bg-zinc-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-center text-xl tracking-widest"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep("username");
                    setOtp("");
                    setDevOtp(null);
                  }}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  다시 요청
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded transition-colors"
                >
                  확인
                </button>
              </div>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === "newPassword" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <p className="text-sm text-gray-400 mb-4">
                새로운 비밀번호를 입력해주세요. (최소 6자)
              </p>

              <div className="flex items-center gap-4">
                <label htmlFor="newPassword" className="w-[35%] text-sm text-gray-300 text-right">
                  새 비밀번호
                </label>
                <div className="w-[65%]">
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    autoComplete="new-password"
                    placeholder="새 비밀번호"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoFocus
                    className="w-full px-3 py-2 bg-zinc-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label
                  htmlFor="confirmPassword"
                  className="w-[35%] text-sm text-gray-300 text-right"
                >
                  비밀번호 확인
                </label>
                <div className="w-[65%]">
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    autoComplete="new-password"
                    placeholder="비밀번호 확인"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={resetPasswordMutation.isPending}
                  className="px-6 py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-amber-800 disabled:cursor-not-allowed text-white font-semibold rounded transition-colors"
                >
                  {resetPasswordMutation.isPending ? "변경 중..." : "비밀번호 변경"}
                </button>
              </div>
            </form>
          )}

          {/* Step 4: Success */}
          {step === "success" && (
            <div className="text-center py-4">
              <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-white mb-2">비밀번호가 변경되었습니다</h3>
              <p className="text-sm text-gray-400 mb-6">새로운 비밀번호로 로그인해주세요.</p>
              <button
                onClick={handleGoToLogin}
                className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded transition-colors"
              >
                로그인 페이지로 이동
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
