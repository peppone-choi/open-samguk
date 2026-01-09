"use client";

import React, { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { MapCityBasic, type MapCityParsed } from "./MapCityBasic";
import { MapCityDetail } from "./MapCityDetail";

// ============================================================================
// Constants
// ============================================================================

const CURRENT_MAP_VERSION = 2;

// ============================================================================
// Types
// ============================================================================

export type { MapCityParsed } from "./MapCityBasic";

export type CityPositionMap = {
  [cityID: number]: [string, number, number];
};

// Raw map data from API
export interface MapResult {
  version?: number;
  year: number;
  month: number;
  startYear: number;
  cityList: [number, number, number, number, number, number][]; // [id, level, state, nationID, region, supply]
  nationList: [number, string, string, number][]; // [id, name, color, capital]
  spyList: { [cityId: number]: number };
  shownByGeneralList: number[];
  myCity: number | null;
  myNation: number | null;
}

interface MapCityDrawable {
  cityList: MapCityParsed[];
  myCity?: number;
}

interface MapNationParsed {
  id: number;
  name: string;
  color: string;
  capital: number;
}

interface MapViewerProps {
  width?: "full" | "small" | "auto";
  imagePath: string;
  mapName: string;
  isDetailMap?: boolean;
  disallowClick?: boolean;
  genHref?: (cityID: number) => string;
  cityPosition: CityPositionMap;
  formatCityInfo?: (city: MapCityParsed) => MapCityParsed;
  mapData: MapResult;
  value?: MapCityParsed;
  onCityClick?: (city: MapCityParsed, e: React.MouseEvent | React.TouchEvent) => void;
  onParsed?: (drawable: MapCityDrawable) => void;
  onChange?: (city: MapCityParsed) => void;
}

// ============================================================================
// Helper Functions
// ============================================================================

function convertDictById<T extends { id: number }>(arr: T[]): { [id: number]: T } {
  return arr.reduce(
    (acc, item) => {
      acc[item.id] = item;
      return acc;
    },
    {} as { [id: number]: T }
  );
}

// ============================================================================
// Component
// ============================================================================

export function MapViewer({
  width,
  imagePath,
  mapName,
  isDetailMap = false,
  disallowClick = false,
  genHref,
  cityPosition,
  formatCityInfo = (city) => city,
  mapData,
  value: _value,
  onCityClick,
  onParsed,
  onChange,
}: MapViewerProps) {
  // State
  const [hideMapCityName, setHideMapCityName] = useState(false);
  const [toggleSingleTap, setToggleSingleTap] = useState(false);
  const [activatedCity, setActivatedCity] = useState<MapCityParsed | undefined>();
  const [touchState, setTouchState] = useState(0);
  const [cursorType, setCursorType] = useState<"mouse" | "touch">("mouse");

  // Refs
  const mapAreaRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isOutside, setIsOutside] = useState(true);
  const [tooltipWidth, setTooltipWidth] = useState(120);

  // Determine width mode
  const isFullWidth = useMemo(() => {
    if (width === "full") return true;
    if (width === "small") return false;
    // Auto mode: check window width
    return typeof window !== "undefined" && window.innerWidth >= 1000;
  }, [width]);

  // Parse map data into drawable format
  const drawableMap = useMemo((): MapCityDrawable | undefined => {
    if ((mapData.version ?? 0) !== CURRENT_MAP_VERSION) {
      return undefined;
    }

    // Convert raw arrays to objects
    function toCityObj([id, level, state, nationID, region, supply]: MapResult["cityList"][0]) {
      return {
        id,
        level,
        state,
        nationID: nationID > 0 ? nationID : undefined,
        region,
        supply: supply !== 0,
      };
    }

    function toNationObj([id, name, color, capital]: MapResult["nationList"][0]): MapNationParsed {
      return { id, name, color, capital };
    }

    const nationList = convertDictById(mapData.nationList.map(toNationObj));
    const spyList = mapData.spyList;
    const shownByGeneralList = new Set(mapData.shownByGeneralList);
    const myCity = mapData.myCity;
    const myNation = mapData.myNation;

    // Merge position info
    function mergePositionInfo(city: ReturnType<typeof toCityObj>) {
      const id = city.id;
      if (!(id in cityPosition)) {
        throw new TypeError(`Unknown cityID: ${id}`);
      }
      const [name, x, y] = cityPosition[id];
      return { ...city, name, x, y };
    }

    // Merge nation info
    function mergeNationInfo(city: ReturnType<typeof mergePositionInfo>) {
      const nationID = city.nationID;
      if (nationID === undefined || !(nationID in nationList)) {
        return { ...city, isCapital: false, nation: undefined, color: undefined };
      }
      const nationObj = nationList[nationID];
      return {
        ...city,
        nation: nationObj.name,
        color: nationObj.color,
        isCapital: nationObj.capital === city.id,
      };
    }

    // Merge clickable info
    function mergeClickable(city: ReturnType<typeof mergeNationInfo>) {
      const id = city.id;
      const nationID = city.nationID;

      if (disallowClick) {
        return { ...city, clickable: 0 };
      }

      let clickable = 16;
      if (id in spyList) {
        clickable |= spyList[id] << 3;
      }
      if (myNation !== null && nationID === myNation) {
        clickable |= 4;
      }
      if (shownByGeneralList.has(id)) {
        clickable |= 2;
      }
      if (myCity !== null && id === myCity) {
        clickable |= 2;
      }

      return { ...city, clickable };
    }

    // Add text fields
    function addTextFields(city: ReturnType<typeof mergeClickable>): MapCityParsed {
      return {
        ...city,
        region_str: `지역${city.region}`,
        level_str: `레벨${city.level}`,
        text: city.name,
      };
    }

    const cityList = mapData.cityList
      .map(toCityObj)
      .map(mergePositionInfo)
      .map(mergeNationInfo)
      .map(mergeClickable)
      .map(addTextFields)
      .map(formatCityInfo);

    const result = {
      cityList,
      myCity: myCity ?? undefined,
    };

    onParsed?.(result);
    return result;
  }, [mapData, cityPosition, disallowClick, formatCityInfo, onParsed]);

  // Get map season class
  const mapSeasonClass = useMemo(() => {
    const { month } = mapData;
    if (month <= 3) return "map_spring";
    if (month <= 6) return "map_summer";
    if (month <= 9) return "map_fall";
    return "map_winter";
  }, [mapData.month]);

  // Get title color
  const titleColor = useMemo(() => {
    const { startYear, year } = mapData;
    if (year < startYear + 1) return "magenta";
    if (year < startYear + 2) return "orange";
    if (year < startYear + 3) return "yellow";
    return undefined;
  }, [mapData.startYear, mapData.year]);

  // Tooltip title
  const titleTooltip = useMemo(() => {
    const result: string[] = [];
    const { startYear, year, month } = mapData;

    if (year <= startYear + 3) {
      const totalMonthsLeft = (startYear + 3 - year) * 12 + (12 - month);
      const remainYear = Math.floor(totalMonthsLeft / 12);
      const remainMonth = totalMonthsLeft % 12;
      result.push(
        `초반제한 기간 : ${remainYear}년${remainMonth > 0 ? ` ${remainMonth}개월` : ""} (${startYear + 3}년)`
      );
    }

    // Tech level info would come from game const context
    result.push(`기술등급 제한 : 정보 필요`);

    return result.join("\n");
  }, [mapData]);

  // Mouse tracking
  useEffect(() => {
    const mapArea = mapAreaRef.current;
    if (!mapArea) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = mapArea.getBoundingClientRect();
      setCursorPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsOutside(false);
      setCursorType("mouse");
    };

    const handleMouseLeave = () => {
      setIsOutside(true);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const rect = mapArea.getBoundingClientRect();
        setCursorPos({
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top,
        });
        setIsOutside(false);
        setCursorType("touch");
      }
    };

    mapArea.addEventListener("mousemove", handleMouseMove);
    mapArea.addEventListener("mouseleave", handleMouseLeave);
    mapArea.addEventListener("touchmove", handleTouchMove);

    return () => {
      mapArea.removeEventListener("mousemove", handleMouseMove);
      mapArea.removeEventListener("mouseleave", handleMouseLeave);
      mapArea.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  // Tooltip width tracking
  useEffect(() => {
    if (tooltipRef.current) {
      const width = tooltipRef.current.offsetWidth;
      if (width > 0) {
        setTooltipWidth(width);
      }
    }
  }, [activatedCity]);

  // Event handlers
  const handleCityClick = useCallback(
    (city: MapCityParsed, e: React.MouseEvent | React.TouchEvent) => {
      if (cursorType === "touch") {
        if (touchState === 1 && activatedCity?.id !== city.id) {
          setTouchState(0);
          setActivatedCity(undefined);
        }
        if (touchState === 0) {
          setTouchState(1);
          setActivatedCity(city);
          e.preventDefault();
          if (!toggleSingleTap) {
            return;
          }
        }
      }
      onCityClick?.(city, e);
      onChange?.(city);
    },
    [cursorType, touchState, activatedCity, toggleSingleTap, onCityClick, onChange]
  );

  const handleClickOutside = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setTouchState(0);
    setActivatedCity(undefined);
  }, []);

  const handleMouseEnter = useCallback(
    (city: MapCityParsed) => {
      if (cursorType === "mouse") {
        setActivatedCity(city);
        setTouchState(0);
      }
    },
    [cursorType]
  );

  const handlePointerLeave = useCallback(() => {
    setActivatedCity(undefined);
    setTouchState(0);
  }, []);

  // Calculate tooltip position
  const tooltipLeft = useMemo(() => {
    const maxWidth = isFullWidth ? 700 : 500;
    if (cursorPos.x + tooltipWidth + 10 > maxWidth) {
      return cursorPos.x - tooltipWidth - 5;
    }
    return cursorPos.x + 10;
  }, [cursorPos.x, tooltipWidth, isFullWidth]);

  // Version mismatch
  if ((mapData.version ?? 0) !== CURRENT_MAP_VERSION) {
    return (
      <div className="world_map">
        <span className="map_title_text">
          맵 버전이 맞지 않습니다.
          <br />
          렌더러 버전: {CURRENT_MAP_VERSION}
          <br />
          API 버전: {mapData.version ?? 0}
        </span>
      </div>
    );
  }

  return (
    <div
      className={[
        "world_map",
        `map_theme_${mapName}`,
        drawableMap ? "" : "draw_required",
        isDetailMap ? "map_detail" : "map_basic",
        hideMapCityName ? "hide_cityname" : "",
        isFullWidth ? "full_width_map" : "small_width_map",
        mapSeasonClass,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Title */}
      <div className="map_title" title={titleTooltip}>
        <span className="map_title_text" style={{ color: titleColor }}>
          {mapData.year}年 {mapData.month}月
        </span>
      </div>

      {/* Map Body */}
      <div ref={mapAreaRef} className="map_body" onClick={handleClickOutside}>
        <div className="map_bglayer1" />
        <div className="map_bglayer2" />
        <div className="map_bgroad" />

        {/* Control Buttons */}
        <div className="map_button_stack">
          <button
            type="button"
            className={`btn btn-primary map_toggle_cityname btn-sm btn-minimum ${hideMapCityName ? "active" : ""}`}
            onClick={() => setHideMapCityName(!hideMapCityName)}
          >
            도시명 표기
          </button>
          <br />
          <button
            type="button"
            className={`btn btn-secondary map_toggle_single_tap btn-sm btn-minimum ${toggleSingleTap ? "active" : ""}`}
            style={{ display: cursorType !== "mouse" ? "block" : "none" }}
            onClick={() => setToggleSingleTap(!toggleSingleTap)}
          >
            두번 탭 해 도시 이동
          </button>
        </div>

        {/* Cities */}
        {drawableMap &&
          (isDetailMap
            ? drawableMap.cityList.map((city) => (
                <MapCityDetail
                  key={city.id}
                  city={city}
                  imagePath={imagePath}
                  isMyCity={city.id === drawableMap.myCity}
                  isFullWidth={isFullWidth}
                  href={genHref?.(city.id)}
                  onClick={(e) => handleCityClick(city, e)}
                  onMouseEnter={() => handleMouseEnter(city)}
                  onMouseLeave={handlePointerLeave}
                  onTouchLeave={handlePointerLeave}
                />
              ))
            : drawableMap.cityList.map((city) => (
                <MapCityBasic
                  key={city.id}
                  city={city}
                  isMyCity={city.id === drawableMap.myCity}
                  isFullWidth={isFullWidth}
                  href={genHref?.(city.id)}
                  onClick={(e) => handleCityClick(city, e)}
                  onMouseEnter={() => handleMouseEnter(city)}
                  onMouseLeave={handlePointerLeave}
                  onTouchLeave={handlePointerLeave}
                />
              )))}
      </div>

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="city_tooltip"
        style={{
          display: isOutside || !activatedCity ? "none" : "block",
          position: "absolute",
          left: `${tooltipLeft}px`,
          top: `${cursorPos.y + 30}px`,
        }}
      >
        <div className="city_name">{activatedCity?.text}</div>
        <div className="nation_name">{activatedCity?.nation}</div>
      </div>

      <style jsx>{`
        .world_map {
          position: relative;
        }

        .map_title_text {
          margin: auto;
          text-align: center;
          width: 160px;
          display: block;
          line-height: 20px;
          font-size: 14px;
          font-weight: bold;
        }

        .map_body {
          position: relative;
          overflow: hidden;
        }

        .map_body .map_bglayer1,
        .map_body .map_bglayer2,
        .map_body .map_bgroad {
          width: 100%;
          height: 100%;
          position: absolute;
          left: 0;
          top: 0;
        }

        .map_body .map_button_stack {
          position: absolute;
          right: 0;
          bottom: 0;
          text-align: right;
          z-index: 10;
        }

        .map_toggle_cityname::after {
          content: " 끄기";
        }

        .map_toggle_cityname.active::after {
          content: " 켜기";
        }

        .map_toggle_single_tap::after {
          content: " 끄기";
        }

        .map_toggle_single_tap.active::after {
          content: " 켜기";
        }

        .city_tooltip {
          z-index: 16;
          min-width: 120px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          white-space: nowrap;
          font-size: 14px;
          box-shadow:
            0 4px 12px rgba(0, 0, 0, 0.4),
            0 0 0 1px rgba(0, 0, 0, 0.2);
          overflow: hidden;
          backdrop-filter: blur(4px);
        }

        .city_name {
          background: linear-gradient(135deg, rgb(40, 174, 255) 0%, rgb(20, 144, 225) 100%);
          z-index: 6;
          line-height: 18px;
          height: 18px;
          padding: 0 8px;
          font-weight: 600;
          text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
        }

        .nation_name {
          background: linear-gradient(135deg, rgb(35, 154, 235) 0%, rgb(15, 124, 205) 100%);
          z-index: 6;
          line-height: 18px;
          height: 18px;
          border-top: 1px solid rgba(255, 255, 255, 0.15);
          text-align: right;
          padding: 0 8px;
          font-weight: 500;
          text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
        }

        .btn.btn-minimum {
          padding: 2px 8px;
          font-size: 11px;
          border-radius: 4px;
          font-weight: 500;
          transition: all 0.15s ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }

        .btn.btn-minimum:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
        }

        .btn.btn-minimum:active {
          transform: translateY(0);
        }

        .hide_cityname :global(.city_detail_name) {
          display: none;
        }

        /* Full Width Map */
        .full_width_map {
          width: 700px;
          background: black;
          font-size: 14px;
          color: white;
        }

        .full_width_map .map_title {
          width: 700px;
          height: 20px;
          text-align: center;
        }

        .full_width_map .map_body {
          width: 700px;
          height: 500px;
        }

        /* Small Width Map */
        .small_width_map {
          width: 500px;
          background: black;
          font-size: 12px;
          color: white;
        }

        .small_width_map .map_title {
          width: 500px;
          height: 20px;
          text-align: center;
        }

        .small_width_map .map_body {
          width: 500px;
          height: 357px;
        }

        /* City Base */
        :global(.city_base) {
          position: absolute;
          width: 40px;
          height: 30px;
        }

        :global(.city_link) {
          display: block;
          width: 100%;
          height: 100%;
          text-decoration: none;
        }

        :global(.city_img) {
          position: absolute;
        }

        :global(.city_detail_name) {
          background-color: rgba(0, 0, 0, 0.5);
          position: absolute;
          white-space: nowrap;
          left: 70%;
          font-size: 10px;
          bottom: -10px;
          color: white;
        }

        /* Basic Map City Styles */
        .map_basic :global(.city_img) {
          background-color: white;
        }

        .map_basic :global(.city_filler) {
          position: absolute;
          width: 100%;
          height: 100%;
          left: 0;
          top: 0;
          background: transparent;
        }

        .map_basic :global(.city_capital) {
          position: absolute;
          width: 5px;
          height: 5px;
          top: -2px;
          right: -2px;
          background-color: yellow;
        }

        .map_basic :global(.city_state) {
          position: absolute;
          width: 10px;
          height: 10px;
          top: -2px;
          left: -4px;
          background-color: white;
        }

        .map_basic :global(.city_state.city_state_war) {
          background-color: red;
        }

        .map_basic :global(.city_state.city_state_bad) {
          background-color: orange;
        }

        .map_basic :global(.city_state.city_state_good) {
          background-color: blue;
        }

        /* Basic map city sizes */
        .full_width_map.map_basic :global(.city_level_1 .city_img) {
          width: 12px;
          height: 12px;
          left: calc((40px - 12px) / 2);
          top: calc((30px - 12px) / 2);
        }
        .full_width_map.map_basic :global(.city_level_2 .city_img) {
          width: 12px;
          height: 12px;
          left: calc((40px - 12px) / 2);
          top: calc((30px - 12px) / 2);
        }
        .full_width_map.map_basic :global(.city_level_3 .city_img) {
          width: 14px;
          height: 14px;
          left: calc((40px - 14px) / 2);
          top: calc((30px - 14px) / 2);
        }
        .full_width_map.map_basic :global(.city_level_4 .city_img) {
          width: 16px;
          height: 14px;
          left: calc((40px - 16px) / 2);
          top: calc((30px - 14px) / 2);
        }
        .full_width_map.map_basic :global(.city_level_5 .city_img) {
          width: 18px;
          height: 16px;
          left: calc((40px - 18px) / 2);
          top: calc((30px - 16px) / 2);
        }
        .full_width_map.map_basic :global(.city_level_6 .city_img) {
          width: 20px;
          height: 16px;
          left: calc((40px - 20px) / 2);
          top: calc((30px - 16px) / 2);
        }
        .full_width_map.map_basic :global(.city_level_7 .city_img) {
          width: 22px;
          height: 18px;
          left: calc((40px - 22px) / 2);
          top: calc((30px - 18px) / 2);
        }
        .full_width_map.map_basic :global(.city_level_8 .city_img) {
          width: 24px;
          height: 18px;
          left: calc((40px - 24px) / 2);
          top: calc((30px - 18px) / 2);
        }

        /* Small width basic map sizes (5/7 scale) */
        .small_width_map.map_basic :global(.city_level_1 .city_img) {
          width: 8.5px;
          height: 8.5px;
          left: calc((40px - 8.5px) / 2);
          top: calc((30px - 8.5px) / 2);
        }
        .small_width_map.map_basic :global(.city_level_2 .city_img) {
          width: 8.5px;
          height: 8.5px;
          left: calc((40px - 8.5px) / 2);
          top: calc((30px - 8.5px) / 2);
        }
        .small_width_map.map_basic :global(.city_level_3 .city_img) {
          width: 10px;
          height: 10px;
          left: calc((40px - 10px) / 2);
          top: calc((30px - 10px) / 2);
        }
        .small_width_map.map_basic :global(.city_level_4 .city_img) {
          width: 11.4px;
          height: 10px;
          left: calc((40px - 11.4px) / 2);
          top: calc((30px - 10px) / 2);
        }
        .small_width_map.map_basic :global(.city_level_5 .city_img) {
          width: 12.8px;
          height: 11.4px;
          left: calc((40px - 12.8px) / 2);
          top: calc((30px - 11.4px) / 2);
        }
        .small_width_map.map_basic :global(.city_level_6 .city_img) {
          width: 14.3px;
          height: 11.4px;
          left: calc((40px - 14.3px) / 2);
          top: calc((30px - 11.4px) / 2);
        }
        .small_width_map.map_basic :global(.city_level_7 .city_img) {
          width: 15.7px;
          height: 12.8px;
          left: calc((40px - 15.7px) / 2);
          top: calc((30px - 12.8px) / 2);
        }
        .small_width_map.map_basic :global(.city_level_8 .city_img) {
          width: 17.1px;
          height: 12.8px;
          left: calc((40px - 17.1px) / 2);
          top: calc((30px - 12.8px) / 2);
        }

        /* Detail Map Styles */
        .map_detail :global(.city_bg) {
          z-index: 1;
          position: absolute;
          background-position: center;
        }

        .map_detail :global(.city_img) {
          z-index: 2;
        }

        .map_detail :global(.city_filler) {
          position: absolute;
          width: calc(100% + 2px);
          height: calc(100% + 2px);
          left: -1px;
          top: -1px;
          background: transparent;
        }

        .map_detail :global(.city_flag) {
          position: absolute;
          width: 12px;
          height: 12px;
        }

        .map_detail :global(.city_flag img) {
          width: 12px;
          height: 12px;
        }

        .map_detail :global(.city_capital) {
          position: absolute;
          width: 10px;
          height: 10px;
          top: 0;
          right: -1px;
        }

        .map_detail :global(.city_capital img) {
          width: 10px;
          height: 10px;
        }

        .map_detail :global(.city_state) {
          position: absolute;
          top: 5px;
          left: 0;
        }

        /* My city blink animation */
        @keyframes blink-my-city {
          0% {
            outline: dashed 5px transparent;
          }
          50% {
            outline: dashed 5px white;
          }
          100% {
            outline: dashed 5px transparent;
          }
        }

        @keyframes blink-my-city2 {
          0% {
            outline: dashed 4px transparent;
          }
          50% {
            outline: dashed 4px red;
          }
          100% {
            outline: dashed 4px transparent;
          }
        }

        .map_basic :global(.my_city)::before {
          content: "";
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          position: absolute;
          animation-duration: 2s;
          animation-name: blink-my-city;
          animation-iteration-count: infinite;
        }

        .map_basic :global(.my_city)::after {
          content: "";
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          position: absolute;
          animation-duration: 2s;
          animation-name: blink-my-city2;
          animation-iteration-count: infinite;
        }

        @keyframes blink-my-city-d1 {
          0% {
            outline: solid 4px transparent;
          }
          50% {
            outline: solid 4px rgba(255, 0, 0, 1);
          }
          100% {
            outline: solid 4px transparent;
          }
        }

        @keyframes blink-my-city-d2 {
          0% {
            outline: double 4px transparent;
          }
          50% {
            outline: double 4px rgba(192, 192, 192, 1);
          }
          100% {
            outline: double 4px transparent;
          }
        }

        .map_detail :global(.my_city) {
          border-radius: 33%;
        }

        .map_detail :global(.my_city)::before {
          content: "";
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          position: absolute;
          border-radius: 33%;
          overflow: hidden;
          animation-duration: 3.9s;
          animation-name: blink-my-city-d1;
          animation-iteration-count: infinite;
        }

        .map_detail :global(.my_city)::after {
          content: "";
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          position: absolute;
          border-radius: 33%;
          overflow: hidden;
          animation-duration: 3.9s;
          animation-name: blink-my-city-d2;
          animation-iteration-count: infinite;
        }
      `}</style>
    </div>
  );
}
