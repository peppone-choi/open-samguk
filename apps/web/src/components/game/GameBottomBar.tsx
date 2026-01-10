/**
 * GameBottomBar - Mobile bottom navigation bar
 * Ported from legacy/hwe/ts/components/GameBottomBar.vue
 * Only visible on mobile (d-sm-block d-lg-none)
 */

"use client";

import { useState, useRef, useEffect } from "react";

interface MenuItem {
  name: string;
  href?: string;
  onClick?: () => void;
}

interface MenuCategory {
  title: string;
  items: MenuItem[];
}

interface GlobalInfo {
  year: number;
  month: number;
}

interface GeneralInfo {
  permission: number;
  officerLevel: number;
}

interface FrontInfo {
  global: GlobalInfo;
  general: GeneralInfo;
  nation: {
    level: number;
  };
}

interface GlobalMenuItem {
  name: string;
  href?: string;
}

interface GameBottomBarProps {
  frontInfo: FrontInfo;
  globalMenu: GlobalMenuItem[];
  onRefresh: () => void;
}

/**
 * Scroll to a selector
 */
function scrollToSelector(selector: string): void {
  const element = document.querySelector(selector);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

/**
 * Navigate to lobby
 */
function moveLobby(): void {
  window.location.replace("../");
}

export function GameBottomBar({ frontInfo, globalMenu, onRefresh }: GameBottomBarProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showSecret = frontInfo.general.permission >= 1 || frontInfo.general.officerLevel >= 2;

  // Quick navigation items
  const quickNavItems: MenuCategory[] = [
    {
      title: "국가 정보",
      items: [
        { name: "방침", onClick: () => scrollToSelector(".nationNotice") },
        { name: "명령", onClick: () => scrollToSelector("#reservedCommandPanel") },
        { name: "국가", onClick: () => scrollToSelector(".nationInfo") },
        { name: "장수", onClick: () => scrollToSelector(".generalInfo") },
        { name: "도시", onClick: () => scrollToSelector(".cityInfo") },
      ],
    },
    {
      title: "동향 정보",
      items: [
        { name: "지도", onClick: () => scrollToSelector(".mapView") },
        { name: "동향", onClick: () => scrollToSelector(".PublicRecord") },
        { name: "개인", onClick: () => scrollToSelector(".GeneralLog") },
        { name: "정세", onClick: () => scrollToSelector(".WorldHistory") },
      ],
    },
    {
      title: "메시지",
      items: [
        { name: "전체", onClick: () => scrollToSelector(".PublicTalk > .stickyAnchor") },
        { name: "국가", onClick: () => scrollToSelector(".NationalTalk > .stickyAnchor") },
        { name: "개인", onClick: () => scrollToSelector(".PrivateTalk > .stickyAnchor") },
        { name: "외교", onClick: () => scrollToSelector(".DiplomacyTalk > .stickyAnchor") },
      ],
    },
  ];

  // Nation menu items based on permission level
  const nationMenuItems: MenuItem[] = [
    { name: "세력 장수", href: "/game/nation/generals" },
    { name: "내무부", href: "/game/nation/finance" },
  ];

  if (showSecret) {
    nationMenuItems.push(
      { name: "사령부", href: "/game/chief" },
      { name: "부대 편성", href: "/game/troop" }
    );
  }

  return (
    <nav className="gameBottomBar lg:hidden fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-white/10 z-50 transition-all duration-300 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
      <style jsx>{`
        .dropdown-menu {
          max-height: calc(100vh - 70px);
          overflow-y: auto;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .dropdown-menu li {
          font-size: 16px;
        }

        .nav-btn {
          text-align: center;
          width: 100px;
          font-size: 14px;
          padding: 8px 12px;
          position: relative;
          overflow: hidden;
        }

        .nav-btn::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          opacity: 0.5;
        }

        @media (min-width: 500px) {
          .nav-btn {
            width: 125px;
            font-size: 16px;
          }
        }
      `}</style>

      <div className="flex justify-center items-center py-3 gap-2" ref={dropdownRef}>
        {/* Global Menu */}
        <div className="relative">
          <button
            className={`nav-btn rounded-lg transition-all duration-300 border border-white/5 ${
              openDropdown === "global"
                ? "bg-primary/20 text-primary border-primary/30 shadow-glow-sm"
                : "bg-white/5 hover:bg-white/10 text-white/90"
            }`}
            onClick={() => setOpenDropdown(openDropdown === "global" ? null : "global")}
          >
            외부 메뉴 ▲
          </button>
          {openDropdown === "global" && (
            <div className="dropdown-menu absolute bottom-full left-0 mb-3 bg-zinc-900/95 border border-white/10 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] min-w-[220px] p-1 animate-in slide-in-from-bottom-2 fade-in duration-200">
              <div className="grid grid-cols-2 gap-1 p-1">
                {globalMenu.map((item, idx) => (
                  <a
                    key={idx}
                    href={item.href}
                    className="text-white/80 hover:text-white hover:bg-white/10 px-3 py-2 text-sm rounded-lg text-center transition-colors border border-transparent hover:border-white/5"
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Nation Menu */}
        <div className="relative">
          <button
            className={`nav-btn rounded-lg transition-all duration-300 border border-white/5 ${
              openDropdown === "nation"
                ? "bg-blue-600/30 text-blue-300 border-blue-500/30 shadow-[0_0_15px_rgba(37,99,235,0.2)]"
                : "bg-sammo-nation/80 hover:bg-sammo-nation text-white shadow-md"
            }`}
            onClick={() => setOpenDropdown(openDropdown === "nation" ? null : "nation")}
          >
            국가 메뉴 ▲
          </button>
          {openDropdown === "nation" && (
            <div className="dropdown-menu absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-zinc-900/95 border border-white/10 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] min-w-[220px] p-1 animate-in slide-in-from-bottom-2 fade-in duration-200">
              <div className="grid grid-cols-2 gap-1 p-1">
                {nationMenuItems.map((item, idx) => (
                  <a
                    key={idx}
                    href={item.href}
                    className="text-white/80 hover:text-white hover:bg-white/10 px-3 py-2 text-sm rounded-lg text-center transition-colors border border-transparent hover:border-white/5"
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Navigation */}
        <div className="relative">
          <button
            className={`nav-btn rounded-lg transition-all duration-300 border border-white/5 ${
              openDropdown === "quick"
                ? "bg-primary/20 text-primary border-primary/30 shadow-glow-sm"
                : "bg-white/5 hover:bg-white/10 text-white/90"
            }`}
            onClick={() => setOpenDropdown(openDropdown === "quick" ? null : "quick")}
          >
            빠른 이동 ▲
          </button>
          {openDropdown === "quick" && (
            <div className="dropdown-menu absolute bottom-full right-0 mb-3 bg-zinc-900/95 border border-white/10 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] min-w-[320px] animate-in slide-in-from-bottom-2 fade-in duration-200">
              <div className="p-3 space-y-3">
                {quickNavItems.map((category, catIdx) => (
                  <div key={catIdx}>
                    <div className="text-muted-foreground text-xs px-2 py-1 font-bold uppercase tracking-wider">
                      {category.title}
                    </div>
                    <div className="h-px bg-gradient-to-r from-white/10 to-transparent my-1" />
                    <div className="grid grid-cols-4 gap-1">
                      {category.items.map((item, itemIdx) => (
                        <button
                          key={itemIdx}
                          onClick={() => {
                            item.onClick?.();
                            setOpenDropdown(null);
                          }}
                          className="text-white/80 hover:text-white hover:bg-white/10 px-1 py-2 text-sm rounded-lg text-center transition-colors border border-transparent hover:border-white/5"
                        >
                          {item.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="h-px bg-white/10 my-2" />
                <button
                  onClick={() => {
                    moveLobby();
                    setOpenDropdown(null);
                  }}
                  className="w-full bg-red-900/30 hover:bg-red-900/50 text-red-200 border border-red-900/50 px-3 py-2 text-sm rounded-lg transition-colors font-medium"
                >
                  로비로 나가기
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Refresh Button */}
        <button
          className="nav-btn bg-white/5 hover:bg-white/10 text-white/90 rounded-lg border border-white/5 hover:border-primary/30 hover:shadow-glow-sm transition-all duration-300 active:scale-95"
          onClick={onRefresh}
        >
          갱신
        </button>
      </div>
    </nav>
  );
}
