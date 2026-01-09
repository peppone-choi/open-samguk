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
    { name: "세력 장수", href: "/nation/generals" },
    { name: "내무부", href: "/nation/finance" },
  ];

  if (showSecret) {
    nationMenuItems.push({ name: "사령부", href: "/chief" }, { name: "부대 편성", href: "/troop" });
  }

  return (
    <nav className="gameBottomBar lg:hidden fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-700 z-50">
      <style jsx>{`
        .gameBottomBar {
          box-shadow: 0 -1px 0 #1f2937;
        }

        .dropdown-menu {
          max-height: calc(100vh - 50px);
          overflow-y: auto;
        }

        .dropdown-menu li {
          font-size: 16px;
        }

        .nav-btn {
          text-align: center;
          width: 100px;
          font-size: 14px;
          padding: 8px 12px;
        }

        @media (min-width: 500px) {
          .nav-btn {
            width: 125px;
            font-size: 16px;
          }
        }
      `}</style>

      <div className="flex justify-center items-center py-2 gap-1" ref={dropdownRef}>
        {/* Global Menu */}
        <div className="relative">
          <button
            className="nav-btn bg-zinc-700 hover:bg-zinc-600 text-white rounded transition-colors"
            onClick={() => setOpenDropdown(openDropdown === "global" ? null : "global")}
          >
            외부 메뉴 ▲
          </button>
          {openDropdown === "global" && (
            <div className="dropdown-menu absolute bottom-full left-0 mb-1 bg-zinc-800 border border-zinc-600 rounded shadow-lg min-w-[200px]">
              <div className="grid grid-cols-3 gap-1 p-2">
                {globalMenu.map((item, idx) => (
                  <a
                    key={idx}
                    href={item.href}
                    className="text-white hover:bg-zinc-700 px-2 py-1 text-sm rounded text-center"
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
            className="nav-btn bg-sammo-nation hover:opacity-80 text-white rounded transition-colors"
            onClick={() => setOpenDropdown(openDropdown === "nation" ? null : "nation")}
          >
            국가 메뉴 ▲
          </button>
          {openDropdown === "nation" && (
            <div className="dropdown-menu absolute bottom-full left-0 mb-1 bg-zinc-800 border border-zinc-600 rounded shadow-lg min-w-[200px]">
              <div className="grid grid-cols-3 gap-1 p-2">
                {nationMenuItems.map((item, idx) => (
                  <a
                    key={idx}
                    href={item.href}
                    className="text-white hover:bg-zinc-700 px-2 py-1 text-sm rounded text-center"
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
            className="nav-btn bg-zinc-800 hover:bg-zinc-700 text-white rounded transition-colors"
            onClick={() => setOpenDropdown(openDropdown === "quick" ? null : "quick")}
          >
            빠른 이동 ▲
          </button>
          {openDropdown === "quick" && (
            <div className="dropdown-menu absolute bottom-full right-0 mb-1 bg-zinc-800 border border-zinc-600 rounded shadow-lg min-w-[300px]">
              <div className="p-2">
                {quickNavItems.map((category, catIdx) => (
                  <div key={catIdx} className="mb-2">
                    <div className="text-zinc-400 text-xs px-2 py-1">{category.title}</div>
                    <hr className="border-zinc-600 my-1" />
                    <div className="grid grid-cols-3 gap-1">
                      {category.items.map((item, itemIdx) => (
                        <button
                          key={itemIdx}
                          onClick={() => {
                            item.onClick?.();
                            setOpenDropdown(null);
                          }}
                          className="text-white hover:bg-zinc-700 px-2 py-1 text-sm rounded text-center"
                        >
                          {item.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <hr className="border-zinc-600 my-2" />
                <button
                  onClick={() => {
                    moveLobby();
                    setOpenDropdown(null);
                  }}
                  className="w-full bg-zinc-700 hover:bg-zinc-600 text-white px-2 py-2 text-sm rounded"
                >
                  로비로
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Refresh Button */}
        <button
          className="nav-btn bg-zinc-700 hover:bg-zinc-600 text-white rounded transition-colors"
          onClick={onRefresh}
        >
          갱신
        </button>
      </div>
    </nav>
  );
}
