"use client";

/**
 * GlobalMenu - Grid of navigation buttons with dropdown support
 * Ported from legacy/hwe/ts/components/GlobalMenu.vue
 */

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

// Menu item types matching legacy API
export type MenuItem = {
  type: "item";
  name: string;
  url: string;
  newTab?: boolean;
  funcCall?: boolean;
  condShowVar?: string;
};

export type MenuLine = {
  type: "line";
};

export type MenuMulti = {
  type: "multi";
  name: string;
  subMenu: (MenuItem | MenuLine)[];
};

export type MenuSplit = {
  type: "split";
  main: MenuItem;
  subMenu: (MenuItem | MenuLine)[];
};

export type MenuVariant = MenuItem | MenuLine | MenuMulti | MenuSplit;

interface GlobalMenuProps {
  menu: MenuVariant[];
  globalInfo?: Record<string, boolean>;
  variant?: "default" | "primary" | "nation";
  mobileRowSize?: number;
  desktopRowSize?: number;
  onFuncCall?: (url: string) => void;
}

export function GlobalMenu({
  menu,
  globalInfo = {},
  variant = "default",
  mobileRowSize = 4,
  desktopRowSize = 8,
  onFuncCall,
}: GlobalMenuProps) {
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter menu based on conditions
  const filterMenu = (item: MenuVariant): boolean => {
    if (item.type === "item" && item.condShowVar) {
      const cond = item.condShowVar;
      if (cond.startsWith("!")) {
        return !globalInfo[cond.slice(1)];
      }
      return !!globalInfo[cond];
    }
    return true;
  };

  const filteredMenu = menu.filter(filterMenu);

  const handleMenuClick = (e: React.MouseEvent, item: MenuItem) => {
    if (item.funcCall) {
      e.preventDefault();
      onFuncCall?.(item.url);
      return;
    }
    if (!item.url) {
      e.preventDefault();
      return;
    }
    if (item.newTab) {
      e.preventDefault();
      window.open(item.url, "_blank");
    }
  };

  const getButtonClasses = () => {
    const base =
      "h-8 px-2 text-sm font-medium rounded-sm border transition-colors flex items-center justify-center";
    switch (variant) {
      case "primary":
        return `${base} bg-amber-600 hover:bg-amber-500 border-amber-700 text-white`;
      case "nation":
        return `${base} bg-blue-700 hover:bg-blue-600 border-blue-800 text-white`;
      default:
        return `${base} bg-zinc-700 hover:bg-zinc-600 border-gray-600 text-white`;
    }
  };

  const renderMenuItem = (item: MenuItem) => {
    if (item.url && !item.funcCall) {
      return (
        <Link
          href={item.url}
          target={item.newTab ? "_blank" : undefined}
          className={getButtonClasses()}
          onClick={(e) => handleMenuClick(e, item)}
        >
          {item.name}
        </Link>
      );
    }
    return (
      <button
        type="button"
        className={getButtonClasses()}
        onClick={(e) => handleMenuClick(e, item)}
      >
        {item.name}
      </button>
    );
  };

  const renderDropdown = (item: MenuMulti | MenuSplit, index: number) => {
    const isOpen = openDropdown === index;
    const mainItem = item.type === "split" ? item.main : null;

    return (
      <div className="relative">
        <div className="flex">
          {mainItem && (
            <Link
              href={mainItem.url}
              className={`${getButtonClasses()} rounded-r-none flex-1`}
              onClick={(e) => handleMenuClick(e, mainItem)}
            >
              {mainItem.name}
            </Link>
          )}
          <button
            type="button"
            onClick={() => setOpenDropdown(isOpen ? null : index)}
            className={`${getButtonClasses()} ${mainItem ? "rounded-l-none border-l-0 px-1" : ""} gap-1`}
          >
            {item.type === "multi" && item.name}
            <ChevronDown size={14} />
          </button>
        </div>

        {isOpen && (
          <div className="absolute top-full left-0 mt-1 min-w-[120px] bg-zinc-800 border border-gray-600 rounded shadow-lg z-50">
            {item.subMenu.map((subItem, subIdx) => {
              if (subItem.type === "line") {
                return <hr key={subIdx} className="border-gray-600 my-1" />;
              }
              return (
                <Link
                  key={subIdx}
                  href={subItem.url}
                  target={subItem.newTab ? "_blank" : undefined}
                  className="block px-3 py-2 text-sm text-gray-300 hover:bg-zinc-700 hover:text-white transition-colors"
                  onClick={(e) => {
                    handleMenuClick(e, subItem);
                    setOpenDropdown(null);
                  }}
                >
                  {subItem.name}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={menuRef}
      className="grid gap-1"
      style={{
        gridTemplateColumns: `repeat(var(--cols), 1fr)`,
        // @ts-expect-error CSS custom property
        "--cols": desktopRowSize,
      }}
    >
      <style jsx>{`
        @media (max-width: 500px) {
          div {
            --cols: ${mobileRowSize} !important;
          }
        }
      `}</style>
      {filteredMenu.map((item, idx) => {
        if (item.type === "item") {
          return <div key={idx}>{renderMenuItem(item)}</div>;
        }
        if (item.type === "multi" || item.type === "split") {
          return <div key={idx}>{renderDropdown(item, idx)}</div>;
        }
        return null;
      })}
    </div>
  );
}
