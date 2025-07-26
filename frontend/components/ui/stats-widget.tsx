"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlowingEffect } from './glowing-effect';

// A small utility function to generate random numbers in a range
const getRandom = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// A function to generate a smooth SVG path from data points
const generateSmoothPath = (points: number[], width: number, height: number) => {
    if (!points || points.length < 2) {
        return `M 0 ${height}`;
    }

    const xStep = width / (points.length - 1);
    const pathData = points.map((point, i) => {
        const x = i * xStep;
        // Scale point to height, with a small padding from top/bottom
        const y = height - (point / 100) * (height * 0.8) - (height * 0.1);
        return [x, y];
    });

    let path = `M ${pathData[0][0]} ${pathData[0][1]}`;

    for (let i = 0; i < pathData.length - 1; i++) {
        const x1 = pathData[i][0];
        const y1 = pathData[i][1];
        const x2 = pathData[i + 1][0];
        const y2 = pathData[i + 1][1];
        const midX = (x1 + x2) / 2;
        path += ` C ${midX},${y1} ${midX},${y2} ${x2},${y2}`;
    }

    return path;
};

interface StatsWidgetProps {
    title?: string;
    amount: number;
    change: number;
    chartData?: number[];
    currency?: string;
    className?: string;
    autoUpdate?: boolean;
}

const StatsWidget = ({ 
    title = "This Week", 
    amount, 
    change, 
    chartData = [30, 55, 45, 75, 60, 85, 70],
    currency = "$",
    className,
    autoUpdate = false
}: StatsWidgetProps) => {
    const [stats, setStats] = useState({
        amount,
        change,
        chartData,
    });
    const linePathRef = useRef<SVGPathElement>(null);
    const areaPathRef = useRef<SVGPathElement>(null);

    // Function to generate new random data for interactivity
    const updateStats = () => {
        if (!autoUpdate) return;
        
        const newAmount = getRandom(100, 999);
        const newChange = getRandom(-50, 100);
        const newChartData = Array.from({ length: 7 }, () => getRandom(10, 90));

        setStats({
            amount: newAmount,
            change: newChange,
            chartData: newChartData,
        });
    };

    // Auto-update stats every 3 seconds if enabled
    useEffect(() => {
        if (!autoUpdate) return;
        const intervalId = setInterval(updateStats, 3000);
        return () => clearInterval(intervalId);
    }, [autoUpdate]);

    // Update stats when props change
    useEffect(() => {
        setStats({ amount, change, chartData });
    }, [amount, change, chartData]);

    // SVG viewbox dimensions
    const svgWidth = 150;
    const svgHeight = 60;

    // Generate the SVG path for the line, memoized for performance
    const linePath = useMemo(() => generateSmoothPath(stats.chartData, svgWidth, svgHeight), [stats.chartData]);

    // Generate the SVG path for the gradient area
    const areaPath = useMemo(() => {
        if (!linePath.startsWith("M")) return "";
        return `${linePath} L ${svgWidth} ${svgHeight} L 0 ${svgHeight} Z`;
    }, [linePath]);

    // Animate the line graph on change
    useEffect(() => {
        const path = linePathRef.current;
        const area = areaPathRef.current;

        if (path && area) {
            const length = path.getTotalLength();
            // --- Animate Line ---
            path.style.transition = 'none';
            path.style.strokeDasharray = length + ' ' + length;
            path.style.strokeDashoffset = String(length);

            // --- Animate Area ---
            area.style.transition = 'none';
            area.style.opacity = '0';

            // Trigger reflow to apply initial styles before transition
            path.getBoundingClientRect();

            // --- Start Transitions ---
            path.style.transition = 'stroke-dashoffset 0.8s ease-in-out, stroke 0.5s ease';
            path.style.strokeDashoffset = '0';

            area.style.transition = 'opacity 0.8s ease-in-out 0.2s, fill 0.5s ease'; // Delay start
            area.style.opacity = '1';
        }
    }, [linePath]);

    const isPositiveChange = stats.change >= 0;
    const changeColorClass = isPositiveChange ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
    const graphStrokeColor = isPositiveChange ? '#22C55E' : '#EF4444';
    const gradientId = isPositiveChange ? 'areaGradientSuccess' : 'areaGradientDestructive';

    return (
        <div className={cn(
            "relative h-full rounded-[1.25rem] border-[0.75px] border-border p-2 md:rounded-[1.5rem] md:p-3",
            className
        )}>
            <GlowingEffect
                spread={40}
                glow={true}
                disabled={false}
                proximity={200}
                inactiveZone={0.01}
                borderWidth={3}
            />
            <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl border-[0.75px] bg-card text-card-foreground p-6 shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)] md:p-6">
                <div className="flex justify-between items-center">
                {/* Left side content */}
                <div className="flex flex-col w-1/2">
                    <div className="flex items-center text-muted-foreground text-sm mb-2">
                        <span>{title}</span>
                        <span className={cn("ml-2 flex items-center font-semibold text-sm", changeColorClass)}>
                            {Math.abs(stats.change)}%
                            {isPositiveChange ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />}
                        </span>
                    </div>
                    <p className="text-3xl font-bold text-foreground">
                        {currency}{stats.amount}
                    </p>
                </div>

                {/* Right side chart */}
                <div className="w-1/2 h-16">
                    <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="areaGradientSuccess" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#22C55E" stopOpacity={0.4}/>
                                <stop offset="100%" stopColor="#22C55E" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="areaGradientDestructive" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#EF4444" stopOpacity={0.4}/>
                                <stop offset="100%" stopColor="#EF4444" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <path
                            ref={areaPathRef}
                            d={areaPath}
                            fill={`url(#${gradientId})`}
                        />
                        <path
                            ref={linePathRef}
                            d={linePath}
                            fill="none"
                            stroke={graphStrokeColor}
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
            </div>
        </div>
        </div>
    );
};

export { StatsWidget };
