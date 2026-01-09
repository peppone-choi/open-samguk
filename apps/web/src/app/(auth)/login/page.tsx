"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/utils/trpc";

export default function LoginPage() {
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
      router.push("/servers");
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

  // Kakao login URL query
  const redirectUri =
    typeof window !== "undefined" ? `${window.location.origin}/auth/kakao/callback` : "";
  const kakaoUrlQuery = trpc.auth.getKakaoLoginUrl.useQuery(
    { redirectUri },
    { enabled: false } // Only fetch when triggered
  );

  const handleKakaoLogin = async () => {
    setError(null);
    try {
      const result = await kakaoUrlQuery.refetch();
      if (result.data?.url) {
        window.location.href = result.data.url;
      }
    } catch (err) {
      setError("카카오 로그인을 시작할 수 없습니다.");
    }
  };

  const handlePasswordReset = () => {
    setDropdownOpen(false);
    router.push("/reset-password");
  };

  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center px-4 py-8">
      {/* Page Title */}
      <h1 className="text-3xl font-bold text-primary mb-8">삼국지 모의전투 HiDCHe</h1>

      {/* Login Card */}
      <div className="w-full max-w-[450px] bg-zinc-800 border border-gray-600 rounded-lg overflow-hidden">
        {/* Card Header */}
        <div className="bg-zinc-900 border-b border-gray-600 px-4 py-3">
          <h2 className="text-lg font-semibold text-white">로그인</h2>
        </div>

        {/* Card Body */}
        <div className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded text-red-200 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Field */}
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

            {/* Password Field */}
            <div className="flex items-center gap-4">
              <label htmlFor="password" className="w-[35%] text-sm text-gray-300 text-right">
                비밀번호
              </label>
              <div className="w-[65%]">
                <input
                  type="password"
                  id="password"
                  name="password"
                  autoComplete="current-password"
                  placeholder="비밀번호"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Submit Row: Kakao Button + Login Button Group */}
            <div className="flex items-center gap-4 pt-2">
              {/* Kakao Login Button */}
              <div className="w-[35%]">
                <button
                  type="button"
                  onClick={handleKakaoLogin}
                  className="w-full h-11 bg-[#FEE500] hover:bg-[#FDD835] text-[#3C1E1E] font-semibold rounded flex items-center justify-center gap-2 transition-colors"
                  title="카카오톡으로 가입&로그인"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M9 0.5C4.30558 0.5 0.5 3.43159 0.5 7.04412C0.5 9.30551 1.96727 11.2889 4.21234 12.4432L3.36783 15.6692C3.30308 15.9221 3.59686 16.1226 3.81828 15.9749L7.67878 13.4036C8.11174 13.4527 8.55202 13.4779 9 13.4779C13.6944 13.4779 17.5 10.5567 17.5 7.04412C17.5 3.43159 13.6944 0.5 9 0.5Z"
                      fill="#3C1E1E"
                    />
                  </svg>
                  <span className="text-sm">카카오 로그인</span>
                </button>
              </div>

              {/* Login Button with Dropdown */}
              <div className="w-[65%]">
                <div className="flex">
                  {/* Main Login Button */}
                  <button
                    type="submit"
                    className="flex-1 h-11 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-l transition-colors"
                  >
                    로그인
                  </button>

                  {/* Dropdown Toggle */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="h-11 px-3 bg-amber-600 hover:bg-amber-500 text-white border-l border-amber-700 rounded-r transition-colors"
                      aria-label="추가 기능"
                    >
                      <ChevronDown size={16} />
                    </button>

                    {/* Dropdown Menu */}
                    {dropdownOpen && (
                      <div className="absolute right-0 mt-1 w-40 bg-zinc-800 border border-gray-600 rounded shadow-lg z-10">
                        <button
                          type="button"
                          onClick={handlePasswordReset}
                          className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-zinc-700 hover:text-white transition-colors"
                        >
                          비밀번호 초기화
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
