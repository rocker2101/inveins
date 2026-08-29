"use client";

import React, { useEffect, useRef, useState } from "react";
import { Sparkles, Radar, ShieldCheck, Flame, ArrowUpRight } from "lucide-react";

interface Point3D {
  x: number;
  y: number;
  z: number;
  baseRadius: number;
  color: string;
}

export function ParticleSphere() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Mouse interaction coordinates
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const [activeBadge, setActiveBadge] = useState<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = containerRef.current?.clientWidth || 600);
    let height = (canvas.height = containerRef.current?.clientHeight || 600);

    const handleResize = () => {
      if (!canvas || !containerRef.current) return;
      width = canvas.width = containerRef.current.clientWidth;
      height = canvas.height = containerRef.current.clientHeight;
    };

    window.addEventListener("resize", handleResize);

    // Generate 3D Fibonacci Sphere Points
    const numPoints = 700;
    const points: Point3D[] = [];
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

    const colors = [
      "#F3D053", // Vibrant Gold
      "#FFD074", // Light Warm Yellow
      "#FF914D", // Vibrant Sunset Amber
      "#FF5722", // Deep Orange Glow
      "#E91E63", // Subtle Crimson Accent
    ];

    for (let i = 0; i < numPoints; i++) {
      const y = 1 - (i / (numPoints - 1)) * 2; // -1 to 1
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      // Select color based on vertical height / index
      const colorIndex = Math.floor(((y + 1) / 2) * colors.length) % colors.length;

      points.push({
        x,
        y,
        z,
        baseRadius: Math.random() * 1.6 + 1.1,
        color: colors[colorIndex],
      });
    }

    // Rotation angles
    let angleX = 0.2;
    let angleY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      const relativeY = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
      mouseRef.current.targetX = relativeY * 0.4;
      mouseRef.current.targetY = relativeX * 0.4;
    };

    const containerEl = containerRef.current;
    if (containerEl) {
      containerEl.addEventListener("mousemove", handleMouseMove);
    }

    // Animation Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse damping
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      angleY += 0.0035 + mouseRef.current.y * 0.002;
      angleX = 0.2 + mouseRef.current.x * 0.2;

      const centerX = width / 2;
      const centerY = height / 2;
      const sphereRadius = Math.min(width, height) * 0.36;

      // 1. Draw Atmospheric Background Glow
      const bgGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        sphereRadius * 0.1,
        centerX,
        centerY,
        sphereRadius * 1.4
      );
      bgGradient.addColorStop(0, "rgba(243, 208, 83, 0.22)"); // Gold center core
      bgGradient.addColorStop(0.35, "rgba(255, 112, 67, 0.14)"); // Warm amber mid
      bgGradient.addColorStop(0.7, "rgba(142, 36, 170, 0.08)"); // Subtle dark magenta boundary
      bgGradient.addColorStop(1, "rgba(6, 7, 10, 0)"); // Fades to dark space

      ctx.fillStyle = bgGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, sphereRadius * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // 2. Draw Tilted Orbital Dotted Rings
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(0.35 + mouseRef.current.y * 0.1);

      // Orbital Ring 1
      ctx.beginPath();
      ctx.ellipse(0, 0, sphereRadius * 1.25, sphereRadius * 0.35, -0.4, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(243, 208, 83, 0.18)";
      ctx.setLineDash([4, 8]);
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Orbital Ring 2
      ctx.beginPath();
      ctx.ellipse(0, 0, sphereRadius * 1.45, sphereRadius * 0.45, 0.6, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255, 152, 0, 0.12)";
      ctx.setLineDash([6, 10]);
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();

      // 3. Project and Render 3D Sphere Particles
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);

      // Sort points by Z for correct depth sorting (painter's algorithm)
      const projectedPoints = points.map((p) => {
        // Rotate around Y axis
        const x1 = p.x * cosY - p.z * sinY;
        const z1 = p.z * cosY + p.x * sinY;

        // Rotate around X axis
        const y2 = p.y * cosX - z1 * sinX;
        const z2 = z1 * cosX + p.y * sinX;

        // Perspective projection factor
        const perspective = 400;
        const scale = perspective / (perspective + z2 * sphereRadius);
        const projectedX = centerX + x1 * sphereRadius;
        const projectedY = centerY + y2 * sphereRadius;
        const alpha = Math.max(0.08, (z2 + 1) / 2); // Depth opacity (front brighter, back darker)

        return {
          px: projectedX,
          py: projectedY,
          pz: z2,
          alpha,
          radius: p.baseRadius * scale * (z2 > 0 ? 1.2 : 0.8),
          color: p.color,
        };
      });

      projectedPoints.sort((a, b) => a.pz - b.pz);

      // Render points
      for (const p of projectedPoints) {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;

        ctx.beginPath();
        ctx.arc(p.px, p.py, Math.max(0.5, p.radius), 0, Math.PI * 2);
        ctx.fill();

        // Extra glow for key front points
        if (p.pz > 0.65 && p.radius > 1.4) {
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
          ctx.fill();
        }

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      if (containerEl) {
        containerEl.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, []);

  // Interval to cycle through interactive intel cards floating over the sphere
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBadge((prev) => (prev + 1) % 3);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[420px] sm:h-[500px] lg:h-[560px] flex items-center justify-center overflow-hidden cursor-crosshair group"
    >
      {/* HTML5 Canvas 3D Particle Sphere */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0" />

      {/* DYNAMIC FLOATING OVERLAY INTELLIGENCE BADGES (Awwwards Style) */}

      {/* Floating Badge 1 - Top Right */}
      <div
        className={`absolute top-8 right-6 sm:right-12 z-10 transition-all duration-700 transform ${
          activeBadge === 0 ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-80 translate-y-1"
        }`}
      >
        <div className="rounded-2xl bg-[#0f1218]/90 backdrop-blur-md p-3.5 sm:p-4 border border-[#F3D053]/30 shadow-2xl space-y-1.5 max-w-[230px]">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#F3D053]">
              <Flame className="h-3.5 w-3.5 text-[#F3D053] animate-pulse" />
              98% RADAR MATCH
            </span>
            <span className="text-[9px] font-mono text-gray-400">12m ago</span>
          </div>
          <div className="text-xs font-extrabold text-white">Razorpay • SDE-1</div>
          <div className="text-[10px] text-gray-300 font-medium">Bangalore • ₹18–22 LPA</div>
          <div className="flex items-center gap-1 pt-1">
            <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-mono text-white">React</span>
            <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-mono text-white">Node.js</span>
            <span className="rounded bg-[#F3D053]/20 text-[#F3D053] px-1.5 py-0.5 text-[9px] font-mono font-bold">Direct ATS</span>
          </div>
        </div>
      </div>

      {/* Floating Badge 2 - Bottom Left */}
      <div
        className={`absolute bottom-12 left-6 sm:left-10 z-10 transition-all duration-700 transform ${
          activeBadge === 1 ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-80 translate-y-1"
        }`}
      >
        <div className="rounded-2xl bg-[#0f1218]/90 backdrop-blur-md p-3.5 sm:p-4 border border-white/15 shadow-2xl space-y-1.5 max-w-[230px]">
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            VERIFIED ATS SOURCE
          </div>
          <div className="text-xs font-extrabold text-white">Greenhouse & Ashby Direct</div>
          <div className="text-[10px] text-gray-400 font-medium">Bypassing stale job board aggregators</div>
        </div>
      </div>

      {/* Floating Badge 3 - Central Bottom Pill Tag */}
      <div className="absolute bottom-4 z-10 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-black/70 backdrop-blur-md px-4 py-1.5 text-[10px] font-mono font-bold text-gray-300 border border-white/10 shadow-lg">
          <span className="flex h-2 w-2 rounded-full bg-[#F3D053] animate-ping" />
          <span>RADAR INTELLIGENCE • 700+ NODES REAL-TIME SCAN</span>
        </div>
      </div>
    </div>
  );
}
