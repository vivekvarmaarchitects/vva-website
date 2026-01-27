"use client";

import { useEffect, useRef } from "react";

type MouseTrailProps = {
  trailDurationMs?: number;
  enabled?: boolean;
  className?: string;
};

type TrailPoint = {
  x: number;
  y: number;
  time: number;
};

const DEFAULT_TRAIL_DURATION = 280;
const MAX_POINTS = 80;

export default function MouseTrail({
  trailDurationMs = DEFAULT_TRAIL_DURATION,
  enabled = true,
  className = "",
}: MouseTrailProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointsRef = useRef<TrailPoint[]>([]);
  const rafRef = useRef<number | null>(null);
  const sizeRef = useRef({ width: 0, height: 0, dpr: 1 });
  const enabledRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const pointerQuery = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    );

    const updateEnabledState = () => {
      enabledRef.current =
        enabled && pointerQuery.matches && !reducedMotionQuery.matches;
      canvas.style.display = enabledRef.current ? "block" : "none";
      if (!enabledRef.current) {
        pointsRef.current = [];
        ctx.clearRect(0, 0, sizeRef.current.width, sizeRef.current.height);
      }
    };

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;
      sizeRef.current = { width, height, dpr };
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!enabledRef.current) return;
      if (event.pointerType && event.pointerType !== "mouse") return;
      const now = performance.now();
      pointsRef.current.push({
        x: event.clientX,
        y: event.clientY,
        time: now,
      });
      if (pointsRef.current.length > MAX_POINTS) {
        pointsRef.current.shift();
      }
    };

    const drawFrame = () => {
      const now = performance.now();
      const { width, height } = sizeRef.current;
      ctx.clearRect(0, 0, width, height);

      if (enabledRef.current) {
        const points = pointsRef.current;
        let startIndex = 0;
        while (
          startIndex < points.length &&
          now - points[startIndex].time > trailDurationMs
        ) {
          startIndex += 1;
        }
        if (startIndex > 0) {
          points.splice(0, startIndex);
        }

        const isDark = document.documentElement.classList.contains("dark");
        const channel = isDark ? 255 : 0;
        const maxAlpha = 0.9;

        for (let i = 1; i < points.length; i += 1) {
          const prev = points[i - 1];
          const next = points[i];
          const alpha = maxAlpha;
          if (alpha <= 0) continue;
          ctx.strokeStyle = `rgba(${channel}, ${channel}, ${channel}, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(next.x, next.y);
          ctx.stroke();
        }
      }

      rafRef.current = requestAnimationFrame(drawFrame);
    };

    updateEnabledState();
    handleResize();

    window.addEventListener("resize", handleResize);
    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    pointerQuery.addEventListener("change", updateEnabledState);
    reducedMotionQuery.addEventListener("change", updateEnabledState);

    rafRef.current = requestAnimationFrame(drawFrame);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", handlePointerMove);
      pointerQuery.removeEventListener("change", updateEnabledState);
      reducedMotionQuery.removeEventListener("change", updateEnabledState);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [trailDurationMs, enabled]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none fixed inset-0 z-0 ${className}`.trim()}
      aria-hidden="true"
    />
  );
}
