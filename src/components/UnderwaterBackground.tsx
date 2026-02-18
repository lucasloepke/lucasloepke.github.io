import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

export interface UnderwaterBackgroundProps {
  className?: string
  children?: React.ReactNode
  /** Light intensity */
  intensity?: number
  /** Animation speed */
  speed?: number
}

interface Particle {
  x: number
  y: number
  size: number
  speed: number
  opacity: number
  wobbleOffset: number
}

export function UnderwaterBackground({
  className,
  children,
  intensity = 1,
  speed = 1,
}: UnderwaterBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Particles animation
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = container.getBoundingClientRect()
    let width = rect.width
    let height = rect.height
    canvas.width = width
    canvas.height = height

    let animationId: number
    let tick = 0

    const particles: Particle[] = Array.from({ length: 40 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 1 + Math.random() * 2,
      speed: 0.3 + Math.random() * 0.4,
      opacity: 0.4 + Math.random() * 0.4,
      wobbleOffset: Math.random() * Math.PI * 2,
    }))

    const handleResize = () => {
      const rect = container.getBoundingClientRect()
      width = rect.width
      height = rect.height
      canvas.width = width
      canvas.height = height
    }

    const ro = new ResizeObserver(handleResize)
    ro.observe(container)

    const animate = () => {
      tick += 0.02 * speed
      ctx.clearRect(0, 0, width, height)

      for (const p of particles) {
        p.y -= p.speed * speed
        p.x += Math.sin(tick * 1.5 + p.wobbleOffset) * 0.4

        if (p.y < -10) {
          p.y = height + 10
          p.x = Math.random() * width
        }

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(120, 180, 220, ${p.opacity * 0.7})`
        ctx.fill()
      }

      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationId)
      ro.disconnect()
    }
  }, [speed])

  const duration1 = 8 / speed
  const duration2 = 12 / speed
  const duration3 = 10 / speed

  return (
    <div
      ref={containerRef}
      className={cn("absolute inset-0 overflow-hidden", className)}
      style={{
        background: "linear-gradient(180deg, #003d5c 0%, #002d44 40%, #0b1220 100%)",
      }}
    >
      {/* Caustic light layers */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute -inset-[50%] opacity-30"
          style={{
            background: `
              radial-gradient(ellipse 40% 30% at 30% 30%, rgba(60, 140, 180, ${0.25 * intensity}), transparent),
              radial-gradient(ellipse 35% 40% at 70% 40%, rgba(50, 120, 160, ${0.2 * intensity}), transparent),
              radial-gradient(ellipse 45% 35% at 50% 60%, rgba(70, 150, 190, ${0.22 * intensity}), transparent)
            `,
            animationName: 'caustic1',
            animationDuration: `${duration1}s`,
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            filter: "blur(40px)",
          }}
        />
        <div
          className="absolute -inset-[50%] opacity-25"
          style={{
            background: `
              radial-gradient(ellipse 50% 40% at 60% 35%, rgba(90, 160, 200, ${0.22 * intensity}), transparent),
              radial-gradient(ellipse 40% 45% at 25% 55%, rgba(60, 140, 180, ${0.2 * intensity}), transparent)
            `,
            animationName: 'caustic2',
            animationDuration: `${duration2}s`,
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            filter: "blur(50px)",
          }}
        />
        <div
          className="absolute -inset-[50%] opacity-20"
          style={{
            background: `
              radial-gradient(ellipse 35% 50% at 45% 45%, rgba(100, 170, 210, ${0.25 * intensity}), transparent),
              radial-gradient(ellipse 45% 35% at 75% 65%, rgba(80, 150, 190, ${0.2 * intensity}), transparent)
            `,
            animationName: 'caustic3',
            animationDuration: `${duration3}s`,
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            filter: "blur(35px)",
          }}
        />
      </div>

      {/* Light rays */}
      <div className="absolute inset-0 overflow-hidden">
        {[0, 1, 2, 3, 4].map(i => (
          <div
            key={i}
            className="absolute top-0"
            style={{
              left: `${15 + i * 18}%`,
              width: "8%",
              height: "100%",
              background: `linear-gradient(180deg, rgba(100, 160, 200, ${0.08 * intensity}) 0%, rgba(80, 140, 180, ${0.03 * intensity}) 50%, transparent 80%)`,
              transform: "skewX(-5deg)",
              animationName: 'ray',
              animationDuration: `${6 + i * 2}s`,
              animationTimingFunction: 'ease-in-out',
              animationIterationCount: 'infinite',
              animationDelay: `${i * -1.5}s`,
              filter: "blur(8px)",
            }}
          />
        ))}
      </div>

      {/* Particles canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* Surface shimmer */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-1/4"
        style={{
          background: `linear-gradient(180deg, rgba(80, 140, 180, ${0.12 * intensity}) 0%, transparent 100%)`,
        }}
      />

      {/* Depth fade */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3"
        style={{
          background: "linear-gradient(0deg, rgba(11, 18, 32, 0.9) 0%, transparent 100%)",
        }}
      />

      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, transparent 0%, transparent 50%, rgba(11, 18, 32, 0.75) 100%)",
        }}
      />

      {/* Content layer */}
      {children && <div className="relative z-10 h-full w-full">{children}</div>}
    </div>
  )
}

export default function UnderwaterBackgroundDemo() {
  return <UnderwaterBackground />
}
