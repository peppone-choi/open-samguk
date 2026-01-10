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
    const kakaoUrlQuery = trpc.auth.getKakaoLoginUrl.useQuery(
        { redirectUri },
        { enabled: false }
    );

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
        <div className="w-full max-w-[450px] bg-zinc-900/80 backdrop-blur-md border border-gray-600 rounded-lg overflow-hidden shadow-2xl">
            <div className="bg-zinc-800/90 border-b border-gray-600 px-4 py-3 text-center">
                <h2 className="text-lg font-bold text-primary">로그인</h2>
            </div>

            <div className="p-6">
                {error && (
                    <div className="mb-4 p-3 bg-red-900/40 border border-red-700/50 rounded text-red-200 text-xs">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="flex items-center gap-4">
                        <label htmlFor="username" className="w-[30%] text-sm font-medium text-gray-300">
                            계정명
                        </label>
                        <input
                            type="text"
                            id="username"
                            placeholder="계정명"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="flex-1 px-3 py-2 bg-zinc-950/50 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors text-sm"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <label htmlFor="password" className="w-[30%] text-sm font-medium text-gray-300">
                            비밀번호
                        </label>
                        <input
                            type="password"
                            id="password"
                            placeholder="비밀번호"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="flex-1 px-3 py-2 bg-zinc-950/50 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors text-sm"
                        />
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button
                            type="button"
                            onClick={handleKakaoLogin}
                            className="w-12 h-10 bg-[#FEE500] hover:bg-[#FDD835] text-[#3C1E1E] rounded flex items-center justify-center transition-colors"
                            title="카카오 로그인"
                        >
                            <svg width="20" height="20" viewBox="0 0 18 18" fill="currentColor">
                                <path d="M9 0.5C4.30558 0.5 0.5 3.43159 0.5 7.04412C0.5 9.30551 1.96727 11.2889 4.21234 12.4432L3.36783 15.6692C3.30308 15.9221 3.59686 16.1226 3.81828 15.9749L7.67878 13.4036C8.11174 13.4527 8.55202 13.4779 9 13.4779C13.6944 13.4779 17.5 10.5567 17.5 7.04412C17.5 3.43159 13.6944 0.5 9 0.5Z" />
                            </svg>
                        </button>

                        <button
                            type="button"
                            onClick={() => router.push("/auth/register")}
                            className="flex-1 h-10 bg-zinc-700 hover:bg-zinc-600 text-white font-bold rounded transition-colors text-sm"
                        >
                            가입
                        </button>

                        <div className="flex-[2] flex h-10">
                            <button
                                type="submit"
                                disabled={loginMutation.isPending}
                                className="flex-1 bg-amber-600 hover:bg-amber-500 disabled:bg-amber-800 text-white font-bold rounded-l transition-colors text-sm"
                            >
                                {loginMutation.isPending ? "로그인 중..." : "로그인"}
                            </button>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="h-full px-2 bg-amber-600 hover:bg-amber-500 border-l border-amber-700 rounded-r text-white transition-colors"
                                >
                                    <ChevronDown size={14} />
                                </button>
                                {dropdownOpen && (
                                    <div className="absolute right-0 bottom-full mb-1 w-32 bg-zinc-800 border border-gray-600 rounded shadow-xl z-20">
                                        <button
                                            type="button"
                                            onClick={handlePasswordReset}
                                            className="w-full px-3 py-2 text-left text-xs text-gray-300 hover:bg-zinc-700 hover:text-white transition-colors"
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
