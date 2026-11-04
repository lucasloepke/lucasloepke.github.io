import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

export interface UnderwaterBackgroundProps {
  className?: string
  /** Light intensity */
  intensity?: number
  /** Animation speed */
  speed?: number
}

interface Bubble {
  x: number
  y: number
  size: number
  /** 0 is far away, 1 is close to the viewer. */
  depth: number
  wobbleOffset: number
}

const AREA_PER_BUBBLE = 28000

function createBubble(width: number, height: number): Bubble {
  const depth = Math.random() ** 2
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    size: 1 + depth * 6,
    depth,
    wobbleOffset: Math.random() * Math.PI * 2,
  }
}

function drawBubble(ctx: CanvasRenderingContext2D, b: Bubble) {
  const alpha = 0.25 + b.depth * 0.35
  ctx.beginPath()
  ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2)
  ctx.fillStyle = `rgba(140, 200, 235, ${alpha * 0.18})`
  ctx.fill()
  ctx.strokeStyle = `rgba(170, 220, 245, ${alpha})`
  ctx.lineWidth = 0.75
  ctx.stroke()
  if (b.size > 3) {
    ctx.beginPath()
    ctx.arc(b.x - b.size * 0.35, b.y - b.size * 0.35, b.size * 0.18, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(235, 248, 255, ${alpha})`
    ctx.fill()
  }
}

export function UnderwaterBackground({
  className,
  intensity = 1,
  speed = 1,
}: UnderwaterBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const depthRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    const depthLayer = depthRef.current
    if (!canvas || !container || !depthLayer) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let width = 0
    let height = 0
    let bubbles: Bubble[] = []
    let animationId = 0
    let tick = 0
    let lastScrollY = window.scrollY
    let pendingScroll = 0

    const drawAll = () => {
      ctx.clearRect(0, 0, width, height)
      for (const b of bubbles) drawBubble(ctx, b)
    }

    const handleResize = () => {
      const rect = container.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = rect.width
      height = rect.height
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.round((width * height) / AREA_PER_BUBBLE)
      bubbles = Array.from({ length: count }, (_, i) => bubbles[i] ?? createBubble(width, height))
      if (reduceMotion) drawAll()
    }

    // The further down the page, the deeper the water: the light fades out.
    const updateDepth = () => {
      const range = document.documentElement.scrollHeight - window.innerHeight
      depthLayer.style.opacity = String(range > 0 ? Math.min(window.scrollY / range, 1) : 0)
    }

    const handleScroll = () => {
      pendingScroll += window.scrollY - lastScrollY
      lastScrollY = window.scrollY
      updateDepth()
    }

    const animate = () => {
      tick += 0.02 * speed
      ctx.clearRect(0, 0, width, height)

      for (const b of bubbles) {
        // Scrolling down sends bubbles past you, closer ones faster.
        b.y -= (0.15 + b.depth * 0.5) * speed + pendingScroll * (0.15 + b.depth * 0.75)
        b.x += Math.sin(tick * 1.5 + b.wobbleOffset) * 0.25

        if (b.y < -12) {
          b.y = height + 12
          b.x = Math.random() * width
        } else if (b.y > height + 12) {
          b.y = -12
          b.x = Math.random() * width
        }

        drawBubble(ctx, b)
      }

      pendingScroll = 0
      animationId = requestAnimationFrame(animate)
    }

    const ro = new ResizeObserver(() => {
      handleResize()
      updateDepth()
    })
    ro.observe(container)
    handleResize()
    updateDepth()

    window.addEventListener("scroll", handleScroll, { passive: true })
    if (!reduceMotion) animationId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationId)
      ro.disconnect()
      window.removeEventListener("scroll", handleScroll)
    }
  }, [speed])

  return (
    <div
      ref={containerRef}
      aria-hidden
      className={cn("overflow-hidden", className)}
      style={{
        background: "linear-gradient(180deg, #003d5c 0%, #002d44 40%, #0b1220 100%)",
      }}
    >
      {/* Caustic light layers */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="underwater-motion absolute -inset-[50%] opacity-30"
          style={{
            background: `
              radial-gradient(ellipse 40% 30% at 30% 30%, rgba(60, 140, 180, ${0.25 * intensity}), transparent),
              radial-gradient(ellipse 35% 40% at 70% 40%, rgba(50, 120, 160, ${0.2 * intensity}), transparent),
              radial-gradient(ellipse 45% 35% at 50% 60%, rgba(70, 150, 190, ${0.22 * intensity}), transparent)
            `,
            animationName: "caustic1",
            animationDuration: `${8 / speed}s`,
            animationTimingFunction: "ease-in-out",
            animationIterationCount: "infinite",
            filter: "blur(40px)",
          }}
        />
        <div
          className="underwater-motion absolute -inset-[50%] opacity-25"
          style={{
            background: `
              radial-gradient(ellipse 50% 40% at 60% 35%, rgba(90, 160, 200, ${0.22 * intensity}), transparent),
              radial-gradient(ellipse 40% 45% at 25% 55%, rgba(60, 140, 180, ${0.2 * intensity}), transparent)
            `,
            animationName: "caustic2",
            animationDuration: `${12 / speed}s`,
            animationTimingFunction: "ease-in-out",
            animationIterationCount: "infinite",
            filter: "blur(50px)",
          }}
        />
      </div>

      {/* Light rays */}
      <div className="absolute inset-0 overflow-hidden">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="underwater-motion absolute top-0"
            style={{
              left: `${20 + i * 26}%`,
              width: "8%",
              height: "100%",
              background: `linear-gradient(180deg, rgba(100, 160, 200, ${0.08 * intensity}) 0%, rgba(80, 140, 180, ${0.03 * intensity}) 50%, transparent 80%)`,
              transform: "skewX(-5deg)",
              animationName: "ray",
              animationDuration: `${6 + i * 2}s`,
              animationTimingFunction: "ease-in-out",
              animationIterationCount: "infinite",
              animationDelay: `${i * -1.5}s`,
              filter: "blur(8px)",
            }}
          />
        ))}
      </div>

      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, transparent 0%, transparent 50%, rgba(11, 18, 32, 0.75) 100%)",
        }}
      />

      {/* Depth: covers the light as the page scrolls, bubbles stay on top */}
      <div
        ref={depthRef}
        className="pointer-events-none absolute inset-0 bg-[#0b1220]"
        style={{ opacity: 0 }}
      />

      {/* Bubbles canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  )
}
