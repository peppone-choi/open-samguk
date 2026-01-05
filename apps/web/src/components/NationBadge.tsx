'use client';

import { Badge, type BadgeProps } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type NationType = 'wei' | 'shu' | 'wu' | 'jin' | 'neutral';

interface NationBadgeProps {
    /** 국가 이름 */
    name: string;
    /** 국가 타입 (색상 결정) */
    type?: NationType;
    /** 커스텀 색상 (hex) */
    color?: string;
    /** 크기 */
    size?: 'sm' | 'md' | 'lg';
    /** 추가 클래스 */
    className?: string;
}

const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1',
};

const nationColors: Record<NationType, string> = {
    wei: 'bg-blue-500 text-white hover:bg-blue-600',
    shu: 'bg-green-500 text-white hover:bg-green-600',
    wu: 'bg-red-500 text-white hover:bg-red-600',
    jin: 'bg-yellow-500 text-black hover:bg-yellow-600',
    neutral: 'bg-gray-500 text-white hover:bg-gray-600',
};

export function NationBadge({
    name,
    type = 'neutral',
    color,
    size = 'md',
    className,
}: NationBadgeProps) {
    // 커스텀 색상이 제공된 경우
    if (color) {
        return (
            <span
                className={cn(
                    'inline-flex items-center rounded-full font-semibold transition-colors',
                    sizeClasses[size],
                    className
                )}
                style={{
                    backgroundColor: color,
                    color: isLightColor(color) ? '#000' : '#fff',
                }}
            >
                {name}
            </span>
        );
    }

    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full font-semibold transition-colors',
                sizeClasses[size],
                nationColors[type],
                className
            )}
        >
            {name}
        </span>
    );
}

/**
 * 색상이 밝은지 어두운지 판단
 */
function isLightColor(hex: string): boolean {
    const color = hex.replace('#', '');
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
}

/**
 * 국가 타입 추론 (국가 이름 기반)
 */
export function inferNationType(nationName: string): NationType {
    const normalized = nationName.toLowerCase();
    if (normalized.includes('위') || normalized.includes('wei') || normalized.includes('조조')) {
        return 'wei';
    }
    if (normalized.includes('촉') || normalized.includes('shu') || normalized.includes('유비')) {
        return 'shu';
    }
    if (normalized.includes('오') || normalized.includes('wu') || normalized.includes('손권')) {
        return 'wu';
    }
    if (normalized.includes('진') || normalized.includes('jin')) {
        return 'jin';
    }
    return 'neutral';
}
