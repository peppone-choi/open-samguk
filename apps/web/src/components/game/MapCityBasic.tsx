"use client";

import React, { useRef, useMemo, useCallback } from "react";

// ============================================================================
// Types
// ============================================================================

export interface MapCityParsed {
  id: number;
  name: string;
  x: number;
  y: number;
  level: number;
  state: number;
  nationID?: number;
  nation?: string;
  color?: string;
  region: number;
  region_str: string;
  level_str: string;
  text: string;
  supply: boolean;
  isCapital: boolean;
  clickable: number;
}

interface MapCityBasicProps {
  city: MapCityParsed;
  href?: string;
  isMyCity?: boolean;
  isFullWidth: boolean;
  onClick?: (e: React.MouseEvent | React.TouchEvent) => void;
  onMouseEnter?: (e: React.MouseEvent) => void;
  onMouseLeave?: (e: React.MouseEvent) => void;
  onTouchLeave?: (e: React.TouchEvent) => void;
}

// ============================================================================
// Helper Functions
// ============================================================================

function getCityState(state: number): string {
  if (state < 10) return "good";
  if (state < 40) return "bad";
  if (state < 50) return "war";
  return "wrong";
}

// ============================================================================
// Component
// ============================================================================

export function MapCityBasic({
  city,
  href,
  isMyCity = false,
  isFullWidth,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onTouchLeave,
}: MapCityBasicProps) {
  const touchOnTrackRef = useRef(false);

  // Calculate position based on width mode
  const cityPos = useMemo(() => {
    const { x, y } = city;
    if (isFullWidth) {
      return {
        left: `${x - 20}px`,
        top: `${y - 15}px`,
      };
    }
    return {
      left: `${(x * 5) / 7 - 20}px`,
      top: `${(y * 5) / 7 - 18}px`,
    };
  }, [city.x, city.y, isFullWidth]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      onClick?.(e);
    },
    [onClick]
  );

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onMouseEnter?.(e);
    },
    [onMouseEnter]
  );

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onMouseLeave?.(e);
    },
    [onMouseLeave]
  );

  const handleTouchStart = useCallback(() => {
    touchOnTrackRef.current = true;
  }, []);

  const handleTouchMove = useCallback(() => {
    touchOnTrackRef.current = false;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchOnTrackRef.current) {
        e.stopPropagation();
        onClick?.(e);
      } else {
        onTouchLeave?.(e);
      }
    },
    [onClick, onTouchLeave]
  );

  const handleSilent = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const LinkOrDiv = href ? "a" : "div";

  return (
    <div
      className={`city_base city_base_${city.id} city_level_${city.level}`}
      style={cityPos}
      onMouseEnter={handleSilent}
      onMouseLeave={handleSilent}
    >
      <LinkOrDiv
        className="city_link"
        data-text={city.text}
        data-nation={city.nation}
        data-id={city.id}
        {...(href ? { href } : {})}
        style={{
          cursor: city.clickable ? "pointer" : "default",
        }}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className="city_img"
          style={{
            backgroundColor: city.color || "#ffffff",
          }}
        >
          <div className={`city_filler ${isMyCity ? "my_city" : ""}`} />
          {city.state > 0 && (
            <div className={`city_state city_state_${getCityState(city.state)}`} />
          )}
          {city.nationID && city.nationID > 0 && (
            <div className="city_flag">{city.isCapital && <div className="city_capital" />}</div>
          )}
          <span className="city_detail_name">{city.name}</span>
        </div>
      </LinkOrDiv>
    </div>
  );
}
