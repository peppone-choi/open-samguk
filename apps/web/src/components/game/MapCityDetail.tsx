"use client";

import React, { useRef, useMemo, useCallback } from "react";
import type { MapCityParsed } from "./MapCityBasic";

// ============================================================================
// Types
// ============================================================================

interface MapCityDetailProps {
  city: MapCityParsed;
  href?: string;
  isMyCity?: boolean;
  isFullWidth: boolean;
  imagePath: string;
  onClick?: (e: React.MouseEvent | React.TouchEvent) => void;
  onMouseEnter?: (e: React.MouseEvent) => void;
  onMouseLeave?: (e: React.MouseEvent) => void;
  onTouchLeave?: (e: React.TouchEvent) => void;
}

// ============================================================================
// Helper Functions
// ============================================================================

function unwrap<T>(value: T | undefined | null): T {
  if (value === undefined || value === null) {
    throw new Error("Unexpected undefined or null value");
  }
  return value;
}

// ============================================================================
// Component
// ============================================================================

export function MapCityDetail({
  city,
  href,
  isMyCity = false,
  isFullWidth,
  imagePath,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onTouchLeave,
}: MapCityDetailProps) {
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

  // Get the color code without # for file naming
  const colorCode = city.color?.substring(1).toUpperCase() || "FFFFFF";

  return (
    <div
      className={`city_base city_base_${city.id} city_level_${city.level}`}
      style={cityPos}
      onMouseEnter={handleSilent}
      onMouseLeave={handleSilent}
    >
      {city.color && (
        <div
          className={`city_bg b${colorCode}`}
          style={{
            backgroundImage: `url('${imagePath}/b${colorCode}.png')`,
          }}
        />
      )}

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
        <div className="city_img">
          <img src={`${imagePath}/cast_${city.level}.gif`} alt={`City level ${city.level}`} />
          <div className={`city_filler ${isMyCity ? "my_city" : ""}`} />

          {city.nationID && city.nationID > 0 && (
            <div className="city_flag">
              <img
                src={`${imagePath}/${city.supply ? "f" : "d"}${unwrap(city.color).substring(1).toUpperCase()}.gif`}
                alt="Nation flag"
              />
              {city.isCapital && (
                <div className="city_capital">
                  <img src={`${imagePath}/event51.gif`} alt="Capital" />
                </div>
              )}
            </div>
          )}
          <span className="city_detail_name">{city.name}</span>
        </div>
        {city.state > 0 && (
          <div className="city_state">
            <img src={`${imagePath}/event${city.state}.gif`} alt="City state" />
          </div>
        )}
      </LinkOrDiv>
    </div>
  );
}
