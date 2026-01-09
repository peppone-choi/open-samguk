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
  const { user: authUser, isLoading, isAuthenticated } = useAuth();

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
    <div className="min-h-[calc(100vh-56px)] py-8">
      <div className="game-container px-4">
        {/* Header with back button */}
        <div className="bg2 section_title with_border flex justify-between items-center">
          <span>계 정 관 리</span>
          <Link
            href="/servers"
            className="inline-flex items-center gap-1 px-3 py-1 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded transition-colors"
          >
            <ArrowLeft size={16} />
            돌아가기
          </Link>
        </div>

        <table className="tb_layout w-full">
          <colgroup>
            <col style={{ width: "90px", minWidth: "90px" }} />
            <col style={{ width: "90px", minWidth: "90px" }} />
            <col style={{ width: "90px", minWidth: "90px" }} />
            <col style={{ width: "90px", minWidth: "90px" }} />
            <col style={{ width: "90px", minWidth: "90px" }} />
            <col style={{ minWidth: "90px" }} />
          </colgroup>
          <thead>
            <tr>
              <th colSpan={6} className="bg1 p-2">
                회 원 정 보
              </th>
            </tr>
          </thead>
          <tbody>
            {/* ID */}
            <tr>
              <th className="bg1 p-2">ID</th>
              <td colSpan={5} className="bg0 p-2">
                <span className="text-white">{user.id}</span>
              </td>
            </tr>

            {/* Nickname */}
            <tr>
              <th className="bg1 p-2">닉네임</th>
              <td colSpan={5} className="bg0 p-2" style={{ height: "36px" }}>
                <span className="text-amber-400">{user.nickname}</span>
              </td>
            </tr>

            {/* Grade & ACL */}
            <tr>
              <th className="bg1 p-2">등급</th>
              <td colSpan={2} className="bg0 p-2">
                <span className="text-white">{user.grade}</span>
              </td>
              <td colSpan={3} className="bg0 p-2">
                <span className="text-gray-400">{user.acl || "-"}</span>
              </td>
            </tr>

            {/* Join date & Third party */}
            <tr>
              <th className="bg1 p-2">가입일시</th>
              <td colSpan={2} className="bg0 p-2">
                <span className="text-white">{user.joinDate}</span>
              </td>
              <td colSpan={3} className="bg0 p-2">
                <span className="text-gray-300">
                  개인정보 3자 제공 동의 :{" "}
                  <span className={user.thirdPartyConsent ? "text-green-400" : "text-red-400"}>
                    {user.thirdPartyConsent ? "동의" : "미동의"}
                  </span>
                </span>
                {user.thirdPartyConsent && (
                  <button
                    onClick={handleRevokeThirdParty}
                    className="ml-2 px-2 py-1 bg-zinc-700 hover:bg-zinc-600 text-white text-xs rounded transition-colors"
                  >
                    철회
                  </button>
                )}
              </td>
            </tr>

            {/* OAuth type & Token */}
            <tr>
              <th className="bg1 p-2">인증 방식</th>
              <td colSpan={2} className="bg0 p-2">
                <span className="text-white">{user.oauthType}</span>
              </td>
              <td colSpan={3} className="bg0 p-2">
                <span className="text-gray-300">{user.tokenValidUntil}까지 유효</span>
                <button
                  onClick={handleExtendToken}
                  className="ml-2 px-2 py-1 bg-zinc-700 hover:bg-zinc-600 text-white text-xs rounded transition-colors"
                >
                  연장
                </button>
              </td>
            </tr>

            {/* Section headers */}
            <tr>
              <th className="bg1 p-2"></th>
              <th colSpan={2} className="bg1 p-2">
                회원 탈퇴
              </th>
              <th colSpan={3} className="bg1 p-2">
                비밀번호 변경
              </th>
            </tr>

            {/* Delete account & Password change */}
            <tr>
              <th className="bg1 p-2">
                정보
                <br />
                수정
              </th>
              <td colSpan={2} className="bg0 p-4 align-top">
                <form onSubmit={handleDeleteSubmit} className="space-y-2">
                  <div>
                    <label htmlFor="delete_pw" className="text-sm text-gray-300 block mb-1">
                      현재 비밀번호
                    </label>
                    <input
                      type="password"
                      id="delete_pw"
                      autoComplete="current-password"
                      value={deletePassword}
                      onChange={(e) => {
                        setDeletePassword(e.target.value);
                        if (errors.deletePassword) {
                          setErrors((prev) => ({ ...prev, deletePassword: "" }));
                        }
                      }}
                      className="w-full px-2 py-1 bg-zinc-700 border border-gray-600 rounded text-white text-sm"
                    />
                    {errors.deletePassword && (
                      <p className="text-red-400 text-xs mt-1">{errors.deletePassword}</p>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="w-full px-3 py-2 bg-red-700 hover:bg-red-600 text-white text-sm rounded transition-colors"
                  >
                    탈퇴신청
                  </button>
                </form>
              </td>
              <td colSpan={3} className="bg0 p-4 align-top">
                <form onSubmit={handlePasswordSubmit} className="space-y-2">
                  <div>
                    <label htmlFor="currentPassword" className="text-sm text-gray-300 block mb-1">
                      현재 비밀번호
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      autoComplete="current-password"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-2 py-1 bg-zinc-700 border border-gray-600 rounded text-white text-sm"
                    />
                    {errors.currentPassword && (
                      <p className="text-red-400 text-xs mt-1">{errors.currentPassword}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="newPassword" className="text-sm text-gray-300 block mb-1">
                      새 비밀번호
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      autoComplete="new-password"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-2 py-1 bg-zinc-700 border border-gray-600 rounded text-white text-sm"
                    />
                    {errors.newPassword && (
                      <p className="text-red-400 text-xs mt-1">{errors.newPassword}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="text-sm text-gray-300 block mb-1">
                      비밀번호 확인
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      autoComplete="new-password"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-2 py-1 bg-zinc-700 border border-gray-600 rounded text-white text-sm"
                    />
                    {errors.confirmPassword && (
                      <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="w-full px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm rounded transition-colors"
                  >
                    비밀번호 변경
                  </button>
                </form>
              </td>
            </tr>

            {/* Icon section header */}
            <tr>
              <th className="bg1 p-2"></th>
              <th colSpan={2} className="bg1 p-2">
                현재 / 신규
              </th>
              <th colSpan={3} className="bg1 p-2">
                전용 아이콘 변경
              </th>
            </tr>

            {/* Icon upload */}
            <tr>
              <th className="bg1 p-2">
                전용
                <br />
                아이콘
              </th>
              <td colSpan={2} className="bg0 p-4" style={{ height: "80px" }}>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-zinc-700 border border-gray-600 rounded flex items-center justify-center">
                    {user.iconUrl ? (
                      <img
                        src={user.iconUrl}
                        alt="Current icon"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-500 text-xs">없음</span>
                    )}
                  </div>
                  <div className="w-16 h-16 bg-zinc-700 border border-gray-600 rounded flex items-center justify-center">
                    {newIconPreview ? (
                      <img
                        src={newIconPreview}
                        alt="New icon"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-500 text-xs">미리보기</span>
                    )}
                  </div>
                </div>
              </td>
              <td colSpan={3} className="bg0 p-4">
                <form onSubmit={handleIconSubmit} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleIconChange}
                      accept=".avif,.webp,.jpg,.jpeg,.png,.gif"
                      className="hidden"
                      id="icon-upload"
                    />
                    <input
                      type="text"
                      readOnly
                      value={fileInputRef.current?.files?.[0]?.name || ""}
                      placeholder="파일을 선택하세요"
                      className="flex-1 px-2 py-1 bg-zinc-700 border border-gray-600 rounded text-white text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded transition-colors flex items-center gap-1"
                    >
                      <Upload size={14} />
                      찾아보기
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      className="flex-1 px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm rounded transition-colors"
                    >
                      아이콘 변경
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveIcon}
                      className="px-3 py-2 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded transition-colors flex items-center gap-1"
                    >
                      <Trash2 size={14} />
                      제거
                    </button>
                  </div>
                </form>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <th className="bg1 p-2">도움말</th>
              <td colSpan={5} className="bg0 p-4 text-left text-sm">
                <p className="text-gray-300 leading-relaxed">
                  아이콘은 64 x 64픽셀 ~ 128 x 128픽셀 사이, 50KB 이하의 avif, webp, jpg, gif, png
                  파일만 가능합니다.
                </p>
                <p className="mt-4 text-fuchsia-400 leading-relaxed">
                  탈퇴시 1개월간 정보가 보존되며, 1개월간 재가입이 불가능합니다.
                </p>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
