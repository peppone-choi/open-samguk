"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/utils/trpc";

type CallbackStatus = "loading" | "success" | "error" | "needs_registration";

function KakaoCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuth();

  const [status, setStatus] = useState<CallbackStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Prevent double execution in React Strict Mode
  const hasProcessedRef = useRef(false);

  const loginMutation = trpc.auth.loginWithKakao.useMutation({
    onSuccess: (data) => {
      if (!data.user) {
        setStatus("error");
        setErrorMessage("로그인 응답에 사용자 정보가 없습니다.");
        return;
      }

      auth.login(
        {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresAt: data.expiresAt,
        },
        {
          id: data.user.id,
          username: data.user.username,
          name: data.user.name,
          grade: data.user.grade,
        }
      );

      setStatus("success");

      // Redirect to servers page after brief success message
      setTimeout(() => {
        router.push("/servers");
      }, 1000);
    },
    onError: (err) => {
      // Check if registration is needed
      if (err.message === "User not found. Registration required.") {
        setStatus("needs_registration");
        setErrorMessage("카카오 계정이 연결된 회원이 없습니다. 먼저 회원가입이 필요합니다.");
      } else {
        setStatus("error");
        setErrorMessage(err.message || "카카오 로그인에 실패했습니다.");
      }
    },
  });

  useEffect(() => {
    // Prevent double execution
    if (hasProcessedRef.current) return;

    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    // Handle Kakao OAuth error
    if (error) {
      hasProcessedRef.current = true;
      setStatus("error");
      setErrorMessage(errorDescription || `카카오 로그인 오류: ${error}`);
      return;
    }

    // No code provided
    if (!code) {
      hasProcessedRef.current = true;
      setStatus("error");
      setErrorMessage("인증 코드가 없습니다. 다시 로그인해주세요.");
      return;
    }

    // Build redirect URI (must match the one used when initiating login)
    const redirectUri = `${window.location.origin}/auth/kakao/callback`;

    // Process the authorization code
    hasProcessedRef.current = true;
    loginMutation.mutate({ code, redirectUri });
  }, [searchParams, loginMutation]);

  const handleGoToLogin = () => {
    router.push("/login");
  };

  const handleGoToRegister = () => {
    router.push("/register");
  };

  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-[400px] bg-zinc-800 border border-gray-600 rounded-lg overflow-hidden">
        {/* Card Header */}
        <div className="bg-zinc-900 border-b border-gray-600 px-4 py-3">
          <h2 className="text-lg font-semibold text-white">카카오 로그인</h2>
        </div>

        {/* Card Body */}
        <div className="p-6">
          {status === "loading" && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-300">카카오 계정으로 로그인 중...</p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-green-400 font-medium">로그인 성공!</p>
              <p className="text-gray-400 text-sm">잠시 후 이동합니다...</p>
            </div>
          )}

          {status === "needs_registration" && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <p className="text-yellow-400 font-medium text-center">{errorMessage}</p>
              <div className="flex gap-3 mt-2">
                <button
                  onClick={handleGoToRegister}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded transition-colors"
                >
                  회원가입
                </button>
                <button
                  onClick={handleGoToLogin}
                  className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded transition-colors"
                >
                  로그인
                </button>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <p className="text-red-400 font-medium text-center">{errorMessage}</p>
              <button
                onClick={handleGoToLogin}
                className="mt-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded transition-colors"
              >
                로그인 페이지로
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Loading fallback for Suspense
function CallbackLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
        <p className="text-gray-300">로딩 중...</p>
      </div>
    </div>
  );
}

// Wrap with Suspense for useSearchParams
export default function KakaoCallbackPage() {
  return (
    <Suspense fallback={<CallbackLoading />}>
      <KakaoCallbackContent />
    </Suspense>
  );
}
