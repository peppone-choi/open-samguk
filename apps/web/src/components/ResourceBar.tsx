'use client';

import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Coins, Wheat, Users, Flame, Heart } from 'lucide-react';

export interface ResourceBarProps {
    /** 자원 타입 */
    type: 'gold' | 'rice' | 'troops' | 'train' | 'atmos' | 'hp';
    /** 현재 값 */
    value: number;
    /** 최대 값 (비율 표시용) */
    max?: number;
    /** 레이블 표시 여부 */
    showLabel?: boolean;
    /** 값 표시 여부 */
    showValue?: boolean;
    /** 크기 */
    size?: 'sm' | 'md' | 'lg';
    /** 추가 클래스 */
    className?: string;
}

const resourceConfig = {
    gold: {
        icon: Coins,
        label: '금',
        color: 'bg-yellow-500',
        textColor: 'text-yellow-600',
    },
    rice: {
        icon: Wheat,
        label: '쌀',
        color: 'bg-amber-600',
        textColor: 'text-amber-700',
    },
    troops: {
        icon: Users,
        label: '병력',
        color: 'bg-blue-500',
        textColor: 'text-blue-600',
    },
    train: {
        icon: Flame,
        label: '훈련',
        color: 'bg-orange-500',
        textColor: 'text-orange-600',
    },
    atmos: {
        icon: Flame,
        label: '사기',
        color: 'bg-red-500',
        textColor: 'text-red-600',
    },
    hp: {
        icon: Heart,
        label: '체력',
        color: 'bg-green-500',
        textColor: 'text-green-600',
    },
};

const sizeConfig = {
    sm: {
        height: 'h-2',
        iconSize: 'h-3 w-3',
        textSize: 'text-xs',
        gap: 'gap-1',
    },
    md: {
        height: 'h-3',
        iconSize: 'h-4 w-4',
        textSize: 'text-sm',
        gap: 'gap-2',
    },
    lg: {
        height: 'h-4',
        iconSize: 'h-5 w-5',
        textSize: 'text-base',
        gap: 'gap-2',
    },
};

export function ResourceBar({
    type,
    value,
    max,
    showLabel = true,
    showValue = true,
    size = 'md',
    className,
}: ResourceBarProps) {
    const config = resourceConfig[type];
    const sizeClass = sizeConfig[size];
    const Icon = config.icon;

    const percentage = max ? Math.min((value / max) * 100, 100) : undefined;

    // 숫자 포맷팅 (1000 -> 1k)
    const formatNumber = (num: number): string => {
        if (num >= 1000000) {
            return `${(num / 1000000).toFixed(1)}M`;
        }
        if (num >= 1000) {
            return `${(num / 1000).toFixed(1)}k`;
        }
        return num.toString();
    };

    return (
        <div className={cn('flex items-center', sizeClass.gap, className)}>
            {showLabel && (
                <div className={cn('flex items-center', sizeClass.gap, config.textColor)}>
                    <Icon className={sizeClass.iconSize} />
                    <span className={cn('font-medium', sizeClass.textSize)}>{config.label}</span>
                </div>
            )}

            {percentage !== undefined ? (
                <div className="flex-1 flex items-center gap-2">
                    <Progress
                        value={percentage}
                        className={cn(sizeClass.height, 'flex-1')}
                        indicatorClassName={config.color}
                    />
                    {showValue && max !== undefined && (
                        <span className={cn(sizeClass.textSize, 'text-muted-foreground min-w-[4rem] text-right')}>
                            {formatNumber(value)}/{formatNumber(max)}
                        </span>
                    )}
                </div>
            ) : (
                showValue && (
                    <span className={cn(sizeClass.textSize, 'font-medium')}>
                        {formatNumber(value)}
                    </span>
                )
            )}
        </div>
    );
}

/** 여러 자원을 한 번에 표시하는 컴포넌트 */
interface ResourceSummaryProps {
    gold?: number;
    rice?: number;
    troops?: number;
    maxTroops?: number;
    train?: number;
    atmos?: number;
    hp?: number;
    maxHp?: number;
    compact?: boolean;
    className?: string;
}

export function ResourceSummary({
    gold,
    rice,
    troops,
    maxTroops,
    train,
    atmos,
    hp,
    maxHp,
    compact = false,
    className,
}: ResourceSummaryProps) {
    const size = compact ? 'sm' : 'md';

    return (
        <div className={cn('flex flex-wrap gap-4', className)}>
            {gold !== undefined && (
                <ResourceBar type="gold" value={gold} size={size} showLabel showValue />
            )}
            {rice !== undefined && (
                <ResourceBar type="rice" value={rice} size={size} showLabel showValue />
            )}
            {troops !== undefined && (
                <ResourceBar
                    type="troops"
                    value={troops}
                    max={maxTroops}
                    size={size}
                    showLabel
                    showValue
                />
            )}
            {train !== undefined && (
                <ResourceBar type="train" value={train} max={100} size={size} showLabel showValue />
            )}
            {atmos !== undefined && (
                <ResourceBar type="atmos" value={atmos} max={100} size={size} showLabel showValue />
            )}
            {hp !== undefined && (
                <ResourceBar type="hp" value={hp} max={maxHp} size={size} showLabel showValue />
            )}
        </div>
    );
}
