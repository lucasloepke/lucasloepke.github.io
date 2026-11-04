import { useEffect, useRef } from "react";

const CELL = 44;
const RADIUS = 2.5;
const NEARBY_GLOW = 0.3;
const GLOW_BLUR = 32;
const FADE_PER_FRAME = 0.018;

/**
 * Faint grid where the square under the cursor lights up and fades after it
 * leaves. It listens on its parent, so text above the grid doesn't interrupt it.
 */
export function HoverGrid({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !host || !ctx) return;

    const fade = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0.2 : FADE_PER_FRAME;
    let cols = 0;
    let rows = 0;
    let energy = new Float32Array(0);
    let frame = 0;

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(width / CELL);
      rows = Math.ceil(height / CELL);
      energy = new Float32Array(cols * rows);
    };

    const draw = () => {
      frame = 0;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let active = false;
      for (let i = 0; i < energy.length; i++) {
        if (energy[i] <= 0) continue;
        const x = (i % cols) * CELL;
        const y = Math.floor(i / cols) * CELL;
        // Bright squares throw light onto their neighbors.
        const lit = energy[i] > NEARBY_GLOW;
        ctx.shadowColor = lit ? `rgba(96, 165, 250, ${energy[i] * 0.9})` : "transparent";
        ctx.shadowBlur = lit ? energy[i] * GLOW_BLUR * (canvas.width / canvas.clientWidth) : 0;
        ctx.fillStyle = `rgba(96, 165, 250, ${energy[i] * 0.45})`;
        ctx.fillRect(x + 1, y + 1, CELL - 1, CELL - 1);
        energy[i] = Math.max(0, energy[i] - fade);
        active = true;
      }
      if (active) frame = requestAnimationFrame(draw);
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const cx = (e.clientX - rect.left) / CELL;
      const cy = (e.clientY - rect.top) / CELL;
      for (let r = Math.floor(cy - RADIUS); r <= cy + RADIUS; r++) {
        for (let c = Math.floor(cx - RADIUS); c <= cx + RADIUS; c++) {
          if (r < 0 || c < 0 || r >= rows || c >= cols) continue;
          const distance = Math.hypot(c + 0.5 - cx, r + 0.5 - cy);
          const nearby = Math.max(0, 1 - distance / RADIUS) * NEARBY_GLOW;
          const i = r * cols + c;
          energy[i] = Math.max(energy[i], nearby);
        }
      }
      // The square under the cursor lights up fully; everything around it stays faint.
      const hovered = Math.floor(cy) * cols + Math.floor(cx);
      if (cx >= 0 && cy >= 0 && cx < cols && cy < rows) energy[hovered] = 1;
      if (!frame) frame = requestAnimationFrame(draw);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    host.addEventListener("pointermove", onMove);

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      host.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div
      aria-hidden
      className={`pointer-events-none [mask-image:radial-gradient(ellipse_50%_50%_at_center,black_35%,transparent_100%)] ${className}`}
      style={{
        backgroundImage:
          "linear-gradient(rgba(125, 175, 225, 0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(125, 175, 225, 0.16) 1px, transparent 1px)",
        backgroundSize: `${CELL}px ${CELL}px`,
      }}
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
