"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Grade mapping
function getGradeText(grade: number): string {
  switch (grade) {
    case 0:
      return "일반회원";
    case 1:
      return "정회원";
    case 2:
      return "관리자";
    default:
      return `등급 ${grade}`;
  }
}

export default function AccountPage() {
  const { user: authUser } = useAuth();

  // Map auth user to display format
  const user = {
    id: authUser?.username ?? "-",
    nickname: authUser?.name ?? "-",
    grade: authUser ? getGradeText(authUser.grade) : "-",
    acl: "", // Not available in current auth context
    joinDate: "-", // Not available in current auth context (would need profile API)
    oauthType: "카카오", // Assuming Kakao OAuth (could be extended)
    tokenValidUntil: "-", // Not exposed in auth context
    thirdPartyConsent: true, // Default assumption
    iconUrl: null as string | null, // Not available in current auth context
  };
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [deletePassword, setDeletePassword] = useState("");
  const [newIconPreview, setNewIconPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = "현재 비밀번호를 입력해주세요.";
    }
    if (!passwordForm.newPassword) {
      newErrors.newPassword = "새 비밀번호를 입력해주세요.";
    } else if (passwordForm.newPassword.length < 6) {
      newErrors.newPassword = "비밀번호는 6자 이상이어야 합니다.";
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      console.log("Password change submitted:", passwordForm);
      // TODO: Implement password change logic
    }
  };

  const handleDeleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deletePassword) {
      setErrors({ deletePassword: "비밀번호를 입력해주세요." });
      return;
    }
    console.log("Delete account requested");
    // TODO: Implement account deletion logic
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (50KB max)
      if (file.size > 50 * 1024) {
        alert("파일 크기는 50KB 이하여야 합니다.");
        return;
      }

      // Check file type
      const validTypes = ["image/avif", "image/webp", "image/jpeg", "image/png", "image/gif"];
      if (!validTypes.includes(file.type)) {
        alert("avif, webp, jpg, gif, png 파일만 가능합니다.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setNewIconPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIconSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIconPreview) {
      alert("아이콘을 선택해주세요.");
      return;
    }
    console.log("Icon change submitted");
    // TODO: Implement icon change logic
  };

  const handleRemoveIcon = () => {
    setNewIconPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    console.log("Remove icon requested");
    // TODO: Implement icon removal logic
  };

  const handleExtendToken = () => {
    console.log("Token extension requested");
    // TODO: Implement token extension logic
  };

  const handleRevokeThirdParty = () => {
    console.log("Third party consent revoked");
    // TODO: Implement third party consent revocation
  };

  return (
    <div className="min-h-[calc(100vh-56px)] py-8 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px]" />
      </div>

      <div className="game-container px-4 relative z-10">
        {/* Header with back button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <span className="w-1 h-6 bg-primary rounded-full shadow-[0_0_10px_hsl(var(--primary))]"></span>
            계정 관리
          </h1>
          <Link
            href="/auth/servers"
            className="inline-flex items-center gap-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm rounded-lg transition-all duration-200 border border-white/10 hover:border-white/20"
          >
            <ArrowLeft size={16} />
            돌아가기
          </Link>
        </div>

        <div className="premium-card p-0 overflow-hidden mb-8">
          <div className="bg-black/40 border-b border-white/10 p-4 font-bold text-white/90 backdrop-blur-md">
            회원 정보
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="grid grid-cols-[100px_1fr] items-center gap-4">
                <span className="text-sm text-gray-400">ID</span>
                <span className="text-white font-mono bg-black/20 px-3 py-1 rounded border border-white/5">
                  {user.id}
                </span>
              </div>
              <div className="grid grid-cols-[100px_1fr] items-center gap-4">
                <span className="text-sm text-gray-400">닉네임</span>
                <span className="text-amber-400 font-bold text-lg">{user.nickname}</span>
              </div>
              <div className="grid grid-cols-[100px_1fr] items-center gap-4">
                <span className="text-sm text-gray-400">등급</span>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded border border-primary/30">
                    {user.grade}
                  </span>
                  {user.acl && <span className="text-xs text-gray-500">({user.acl})</span>}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-[100px_1fr] items-center gap-4">
                <span className="text-sm text-gray-400">가입일시</span>
                <span className="text-gray-300">{user.joinDate}</span>
              </div>
              <div className="grid grid-cols-[100px_1fr] items-center gap-4">
                <span className="text-sm text-gray-400">개인정보 제공</span>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm ${user.thirdPartyConsent ? "text-emerald-400" : "text-red-400"}`}
                  >
                    {user.thirdPartyConsent ? "동의함 (3자 제공)" : "미동의"}
                  </span>
                  {user.thirdPartyConsent && (
                    <button
                      onClick={handleRevokeThirdParty}
                      className="text-xs px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded transition-colors"
                    >
                      철회
                    </button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-[100px_1fr] items-center gap-4">
                <span className="text-sm text-gray-400">인증 방식</span>
                <div className="flex flex-col gap-1">
                  <span className="text-white text-sm">{user.oauthType}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{user.tokenValidUntil}까지 유효</span>
                    <button
                      onClick={handleExtendToken}
                      className="text-xs px-2 py-0.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded transition-colors"
                    >
                      연장
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="premium-card p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-primary">🔒</span> 비밀번호 변경
            </h3>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="currentPassword"
                  className="text-xs uppercase text-gray-500 font-semibold tracking-wider"
                >
                  현재 비밀번호
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                />
                {errors.currentPassword && (
                  <p className="text-red-400 text-xs">{errors.currentPassword}</p>
                )}
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="newPassword"
                  className="text-xs uppercase text-gray-500 font-semibold tracking-wider"
                >
                  새 비밀번호
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                />
                {errors.newPassword && <p className="text-red-400 text-xs">{errors.newPassword}</p>}
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="text-xs uppercase text-gray-500 font-semibold tracking-wider"
                >
                  비밀번호 확인
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                />
                {errors.confirmPassword && (
                  <p className="text-red-400 text-xs">{errors.confirmPassword}</p>
                )}
              </div>
              <button
                type="submit"
                className="w-full mt-2 py-2.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-600/50 rounded-lg transition-all font-medium"
              >
                비밀번호 변경하기
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="premium-card p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-primary">🖼️</span> 전용 아이콘
              </h3>
              <div className="flex gap-4 mb-4">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-xs text-gray-500">현재</span>
                  <div className="w-20 h-20 bg-black/40 border border-white/10 rounded-lg flex items-center justify-center overflow-hidden">
                    {user.iconUrl ? (
                      <img
                        src={user.iconUrl}
                        alt="Current"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-600 text-xs">없음</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <span className="text-xs text-gray-500">변경할 이미지</span>
                  <div
                    className="w-20 h-20 bg-black/40 border-2 border-dashed border-white/20 rounded-lg flex items-center justify-center overflow-hidden relative group cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {newIconPreview ? (
                      <img
                        src={newIconPreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Upload
                        className="text-gray-500 group-hover:text-primary transition-colors"
                        size={20}
                      />
                    )}
                  </div>
                </div>
              </div>

              <form onSubmit={handleIconSubmit} className="space-y-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleIconChange}
                  accept=".avif,.webp,.jpg,.jpeg,.png,.gif"
                  className="hidden"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 transition-colors"
                  >
                    파일 선택
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveIcon}
                    className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-red-400 transition-colors"
                    title="아이콘 제거"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-600/50 rounded-lg transition-all font-medium text-sm"
                >
                  아이콘 적용하기
                </button>
                <p className="text-[10px] text-gray-500 mt-2 leading-tight">
                  * 64x64 ~ 128x128 픽셀, 50KB 이하 (avif, webp, jpg, gif, png)
                </p>
              </form>
            </div>

            <div className="premium-card p-6 border-red-900/30 bg-red-950/10">
              <h3 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
                ⚠️ 회원 탈퇴
              </h3>
              <form onSubmit={handleDeleteSubmit} className="space-y-3">
                <div>
                  <input
                    type="password"
                    placeholder="현재 비밀번호 확인"
                    value={deletePassword}
                    onChange={(e) => {
                      setDeletePassword(e.target.value);
                      if (errors.deletePassword) {
                        setErrors((prev) => ({ ...prev, deletePassword: "" }));
                      }
                    }}
                    className="w-full px-3 py-2 bg-black/40 border border-red-900/30 rounded-lg text-white placeholder-red-400/30 focus:outline-none focus:border-red-500/50 text-sm transition-all"
                  />
                  {errors.deletePassword && (
                    <p className="text-red-400 text-xs mt-1">{errors.deletePassword}</p>
                  )}
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors font-medium text-sm shadow-lg shadow-red-900/20"
                >
                  탈퇴 신청하기
                </button>
                <p className="text-[10px] text-red-400/60 mt-2">
                  * 탈퇴시 1개월간 정보가 보존되며, 1개월간 재가입이 불가능합니다.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
