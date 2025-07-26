"use client";
import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";
import { createNoise3D } from "simplex-noise";
import { useTheme } from "next-themes";

export const WavyBackground = ({
  children,
  className,
  containerClassName,
  colors,
  waveWidth,
  backgroundFill,
  blur = 10,
  speed = "fast",
  waveOpacity = 0.5,
  ...props
}: {
  children?: any;
  className?: string;
  containerClassName?: string;
  colors?: string[];
  waveWidth?: number;
  backgroundFill?: string;
  blur?: number;
  speed?: "slow" | "fast";
  waveOpacity?: number;
  [key: string]: any;
}) => {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = theme === 'system' ? systemTheme : theme;
  const isDark = mounted ? currentTheme === 'dark' : false;
  const noise = createNoise3D();
  let w: number,
    h: number,
    nt: number,
    i: number,
    x: number,
    ctx: any,
    canvas: any;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const getSpeed = () => {
    switch (speed) {
      case "slow":
        return 0.001;
      case "fast":
        return 0.002;
      default:
        return 0.001;
    }
  };

  const init = () => {
    canvas = canvasRef.current;
    ctx = canvas.getContext("2d");
    w = ctx.canvas.width = window.innerWidth;
    h = ctx.canvas.height = window.innerHeight;
    ctx.filter = `blur(${blur}px)`;
    nt = 0;
    window.onresize = function () {
      w = ctx.canvas.width = window.innerWidth;
      h = ctx.canvas.height = window.innerHeight;
      ctx.filter = `blur(${blur}px)`;
    };
    render();
  };

  const drawWave = (n: number) => {
    const currentIsDark = mounted ? (theme === 'system' ? systemTheme : theme) === 'dark' : false;
    const currentWaveColors = colors ?? (currentIsDark ? [
      "hsla(31, 97%, 72%, 0.6)", // Light brand orange
      "hsla(280, 85%, 70%, 0.5)", // Purple-magenta
      "hsla(200, 90%, 65%, 0.4)", // Light blue
      "hsla(320, 80%, 68%, 0.35)", // Pink-purple
      "hsla(180, 75%, 60%, 0.3)", // Cyan
    ] : [
      "hsla(27, 96%, 61%, 0.4)", // Primary brand orange
      "hsla(260, 80%, 55%, 0.35)", // Deep purple
      "hsla(220, 85%, 50%, 0.3)", // Blue
      "hsla(300, 75%, 45%, 0.25)", // Magenta
      "hsla(160, 70%, 40%, 0.2)", // Teal
    ]);
    
    nt += getSpeed();
    for (i = 0; i < n; i++) {
      ctx.beginPath();
      ctx.lineWidth = waveWidth || 50;
      ctx.strokeStyle = currentWaveColors[i % currentWaveColors.length];
      for (x = 0; x < w; x += 5) {
        var y = noise(x / 800, 0.3 * i, nt) * 100;
        ctx.lineTo(x, y + h * 0.5); // adjust for height, currently at 50% of the container
      }
      ctx.stroke();
      ctx.closePath();
    }
  };

  let animationId: number;
  const render = () => {
    const currentIsDark = mounted ? (theme === 'system' ? systemTheme : theme) === 'dark' : false;
    ctx.fillStyle = backgroundFill || (currentIsDark ? "#000000" : "#ffffff");
    ctx.globalAlpha = waveOpacity || 0.2;
    ctx.fillRect(0, 0, w, h);
    drawWave(5);
    animationId = requestAnimationFrame(render);
  };

  useEffect(() => {
    if (mounted) {
      init();
    }
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [mounted, theme, systemTheme]);

  const [isSafari, setIsSafari] = useState(false);
  useEffect(() => {
    // I'm sorry but i have got to support it on safari.
    setIsSafari(
      typeof window !== "undefined" &&
        navigator.userAgent.includes("Safari") &&
        !navigator.userAgent.includes("Chrome")
    );
  }, []);

  return (
    <div
      className={cn(
        "h-screen flex flex-col items-center justify-center relative",
        containerClassName
      )}
    >
      <canvas
        className="absolute inset-0 z-0"
        ref={canvasRef}
        id="canvas"
        style={{
          ...(isSafari ? { filter: `blur(${blur}px)` } : {}),
        }}
      ></canvas>
      {/* Semi-transparent overlay for better text readability */}
      <div className="absolute inset-0 bg-background/5 dark:bg-background/10 z-5"></div>
      <div className={cn("relative z-10", className)} {...props}>
        {children}
      </div>
    </div>
  );
};
