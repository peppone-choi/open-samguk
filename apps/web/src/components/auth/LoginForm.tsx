"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/utils/trpc";

export function LoginForm() {
  const router = useRouter();
  const auth = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      if (!data.user) {
        setError("로그인 응답에 사용자 정보가 없습니다.");
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
      router.push("/auth/servers");
    },
    onError: (err) => {
      setError(err.message || "로그인에 실패했습니다.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError("계정명과 비밀번호를 입력해주세요.");
      return;
    }

    loginMutation.mutate({ username: username.trim(), password });
  };

  const redirectUri =
    typeof window !== "undefined" ? `${window.location.origin}/auth/kakao/callback` : "";
  const kakaoUrlQuery = trpc.auth.getKakaoLoginUrl.useQuery({ redirectUri }, { enabled: false });

  const handleKakaoLogin = async () => {
    setError(null);
    try {
      const result = await kakaoUrlQuery.refetch();
      if (result.data?.url) {
        window.location.href = result.data.url;
      }
    } catch {
      setError("카카오 로그인을 시작할 수 없습니다.");
    }
  };

  const handlePasswordReset = () => {
    setDropdownOpen(false);
    router.push("/auth/reset-password");
  };

  return (
    <div className="premium-card w-full max-w-[450px]">
      <div className="mb-6 text-center">
        <h2
          className="text-2xl font-bold text-primary tracking-wide"
          style={{ textShadow: "0 0 20px hsl(var(--primary) / 0.3)" }}
        >
          로그인
        </h2>
        <p className="text-muted-foreground text-sm mt-1">군주님의 귀환을 환영합니다</p>
      </div>

      <div className="">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm backdrop-blur-sm shadow-[0_0_15px_rgba(239,68,68,0.1)]">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              {error}
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="username"
              className="text-xs font-medium text-muted-foreground uppercase tracking-wider ml-1"
            >
              계정명
            </label>
            <input
              type="text"
              id="username"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-white/20 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all duration-300 hover:bg-black/60"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-xs font-medium text-muted-foreground uppercase tracking-wider ml-1"
            >
              비밀번호
            </label>
            <input
              type="password"
              id="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-white/20 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all duration-300 hover:bg-black/60"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleKakaoLogin}
              className="w-12 h-11 bg-[#FEE500] hover:bg-[#FDD835] text-[#3C1E1E] rounded-lg flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5"
              title="카카오 로그인"
            >
              <svg width="22" height="22" viewBox="0 0 18 18" fill="currentColor">
                <path d="M9 0.5C4.30558 0.5 0.5 3.43159 0.5 7.04412C0.5 9.30551 1.96727 11.2889 4.21234 12.4432L3.36783 15.6692C3.30308 15.9221 3.59686 16.1226 3.81828 15.9749L7.67878 13.4036C8.11174 13.4527 8.55202 13.4779 9 13.4779C13.6944 13.4779 17.5 10.5567 17.5 7.04412C17.5 3.43159 13.6944 0.5 9 0.5Z" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => router.push("/auth/register")}
              className="flex-1 h-11 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-lg transition-all duration-300 text-sm hover:-translate-y-0.5 backdrop-blur-sm"
            >
              회원가입
            </button>

            <div className="flex-[2] flex h-11 relative group">
              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="flex-1 btn-primary rounded-r-none h-full text-base font-bold tracking-wide"
              >
                {loginMutation.isPending ? "접속 중..." : "로그인"}
              </button>
              <div className="relative h-full">
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="h-full px-2 bg-amber-600 hover:bg-amber-500 border-l border-amber-700/50 rounded-r-lg text-white transition-colors flex items-center justify-center"
                  style={{
                    background: "linear-gradient(to bottom, hsl(var(--primary)), hsl(45 90% 50%))",
                  }}
                >
                  <ChevronDown size={16} className="text-primary-foreground" />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 bottom-full mb-2 w-40 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                    <button
                      type="button"
                      onClick={handlePasswordReset}
                      className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-primary/20 hover:text-primary transition-colors"
                    >
                      비밀번호 초기화
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
