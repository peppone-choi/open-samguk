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
        router.push("/login");
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
    <div className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center px-4 py-8">
      {/* Page Title */}
      <h1 className="text-3xl font-bold text-primary mb-8">삼국지 모의전투 HiDCHe</h1>

      {/* Register Card */}
      <div className="w-full max-w-[600px] bg-zinc-800 border border-gray-600 rounded-lg overflow-hidden">
        {/* Card Header */}
        <div className="bg-zinc-900 border-b border-gray-600 px-4 py-3">
          <h2 className="text-lg font-semibold text-white">회원가입</h2>
        </div>

        {/* Card Body */}
        <div className="p-6">
          {successMessage && (
            <div className="mb-4 p-3 bg-green-900/50 border border-green-700 rounded text-green-200 text-sm">
              {successMessage}
            </div>
          )}
          {errors.form && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded text-red-200 text-sm">
              {errors.form}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Field */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <label htmlFor="username" className="sm:w-[25%] text-sm text-gray-300 sm:text-right">
                계정명
              </label>
              <div className="sm:w-[75%]">
                <input
                  type="text"
                  id="username"
                  name="username"
                  placeholder="계정명"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-zinc-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
                {errors.username && <p className="mt-1 text-sm text-red-400">{errors.username}</p>}
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <label htmlFor="password" className="sm:w-[25%] text-sm text-gray-300 sm:text-right">
                비밀번호
              </label>
              <div className="sm:w-[75%]">
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="비밀번호"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-zinc-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
                {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <label
                htmlFor="confirmPassword"
                className="sm:w-[25%] text-sm text-gray-300 sm:text-right"
              >
                비밀번호 확인
              </label>
              <div className="sm:w-[75%]">
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="비밀번호 확인"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-zinc-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Nickname Field */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
              <label
                htmlFor="nickname"
                className="sm:w-[25%] text-sm text-gray-300 sm:text-right pt-2"
              >
                닉네임
              </label>
              <div className="sm:w-[75%]">
                <input
                  type="text"
                  id="nickname"
                  name="nickname"
                  placeholder="닉네임"
                  value={formData.nickname}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-zinc-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
                <p className="mt-1 text-xs text-gray-500">
                  깃수가 종료될때 공개됩니다. 장수명과는 다르게 닉네임은 계속해서 고정되니 신중하게
                  정해주세요.
                </p>
                {errors.nickname && <p className="mt-1 text-sm text-red-400">{errors.nickname}</p>}
              </div>
            </div>

            {/* Terms Agreement */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
              <label className="sm:w-[25%] text-sm text-gray-300 sm:text-right pt-2">
                이용 약관
              </label>
              <div className="sm:w-[75%]">
                <div className="bg-zinc-900 border border-gray-600 rounded p-3 max-h-32 overflow-y-auto text-sm text-gray-400">
                  본 서비스의 이용약관입니다. 서비스 이용에 관한 기본적인 사항을 규정합니다. 모든
                  이용자는 본 약관에 동의해야 서비스를 이용할 수 있습니다.
                </div>
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreements.terms}
                    onChange={() => handleAgreementChange("terms")}
                    className="w-4 h-4 accent-primary"
                  />
                  <span className="text-sm text-gray-300">동의합니다.</span>
                </label>
                {errors.terms && <p className="mt-1 text-sm text-red-400">{errors.terms}</p>}
              </div>
            </div>

            {/* Privacy Policy Agreement */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
              <label className="sm:w-[25%] text-sm text-gray-300 sm:text-right pt-2">
                개인정보 제공
                <br />및 이용에 대한 동의
              </label>
              <div className="sm:w-[75%]">
                <div className="bg-zinc-900 border border-gray-600 rounded p-3 max-h-32 overflow-y-auto text-sm text-gray-400">
                  개인정보 수집 및 이용에 관한 동의입니다. 수집하는 개인정보 항목, 수집 목적, 보유
                  기간 등에 대해 안내합니다.
                </div>
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreements.privacy}
                    onChange={() => handleAgreementChange("privacy")}
                    className="w-4 h-4 accent-primary"
                  />
                  <span className="text-sm text-gray-300">동의합니다.</span>
                </label>
                {errors.privacy && <p className="mt-1 text-sm text-red-400">{errors.privacy}</p>}
              </div>
            </div>

            {/* Third Party Agreement (Optional) */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
              <label className="sm:w-[25%] text-sm text-gray-300 sm:text-right pt-2">
                개인정보의 제3자 수집
                <br />
                이용 제공에 대한 동의
                <br />
                <span className="text-gray-500">(선택)</span>
              </label>
              <div className="sm:w-[75%]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreements.thirdParty}
                    onChange={() => handleAgreementChange("thirdParty")}
                    className="w-4 h-4 accent-primary"
                  />
                  <span className="text-sm text-gray-300">동의합니다.</span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-4">
              <div className="sm:w-[25%]"></div>
              <div className="sm:w-[75%]">
                <button
                  type="submit"
                  disabled={registerMutation.isPending || !!successMessage}
                  className="w-full h-12 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {registerMutation.isPending ? "가입 중..." : "가입"}
                </button>
                <p className="mt-4 text-center text-sm text-gray-400">
                  이미 계정이 있으신가요?{" "}
                  <Link href="/login" className="text-primary hover:underline">
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
