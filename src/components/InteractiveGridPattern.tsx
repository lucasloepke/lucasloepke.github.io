import { useCallback, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

export interface InteractiveGridPatternProps {
  className?: string
  children?: React.ReactNode
  /** Size of each grid cell in pixels */
  cellSize?: number
  /** Glow color on hover */
  glowColor?: string
  /** Border color of grid lines */
  borderColor?: string
  /** Mouse proximity radius for subtle highlighting */
  proximity?: number
  /** When set, use this position instead of internal tracking (e.g. from parent so cursor is sensed through overlays) */
  mousePosition?: { x: number; y: number } | null
}

const OFF_SCREEN = { x: -1000, y: -1000 }

export function InteractiveGridPattern({
  className,
  children,
  cellSize = 50,
  glowColor = "rgba(34, 211, 238, 0.4)",
  borderColor = "rgba(40, 70, 100, 0.35)",
  proximity = 100,
  mousePosition: externalMousePosition,
}: InteractiveGridPatternProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [grid, setGrid] = useState({ rows: 0, cols: 0, scale: 1 })
  const [hoveredCell, setHoveredCell] = useState<number | null>(null)
  const [internalMousePos, setInternalMousePos] = useState(OFF_SCREEN)

  const isControlled = externalMousePosition !== undefined
  const mousePos = isControlled ? (externalMousePosition ?? OFF_SCREEN) : internalMousePos

  const updateGrid = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    const { width, height } = container.getBoundingClientRect()
    const scale = Math.max(1, Math.min(width, height) / 800)
    const scaledCellSize = cellSize * scale

    const cols = Math.ceil(width / scaledCellSize) + 1
    const rows = Math.ceil(height / scaledCellSize) + 1

    setGrid({ rows, cols, scale })
  }, [cellSize])

  useEffect(() => {
    updateGrid()
    const container = containerRef.current
    if (!container) return

    const ro = new ResizeObserver(updateGrid)
    ro.observe(container)
    return () => ro.disconnect()
  }, [updateGrid])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isControlled) return
    const container = containerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    setInternalMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }, [isControlled])

  const handleMouseLeave = useCallback(() => {
    if (isControlled) return
    setInternalMousePos(OFF_SCREEN)
    setHoveredCell(null)
  }, [isControlled])

  const scaledCellSize = cellSize * grid.scale
  const scaledProximity = proximity * grid.scale

  // When using external mouse position, derive hovered cell from position
  const colIndex = Math.floor(mousePos.x / scaledCellSize)
  const rowIndex = Math.floor(mousePos.y / scaledCellSize)
  const derivedHoveredCell =
    isControlled && mousePos.x >= 0 && mousePos.y >= 0 && colIndex >= 0 && colIndex < grid.cols && rowIndex >= 0 && rowIndex < grid.rows
      ? rowIndex * grid.cols + colIndex
      : null
  const effectiveHoveredCell = isControlled ? derivedHoveredCell : hoveredCell

  return (
    <div
      ref={containerRef}
      className={cn("absolute inset-0 overflow-hidden", className)}
      style={{ backgroundColor: "#0a1929" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Grid */}
      <div className="absolute inset-0">
        {Array.from({ length: grid.rows }).map((_, r) => (
          <div key={r} className="flex">
            {Array.from({ length: grid.cols }).map((_, c) => {
              const index = r * grid.cols + c
              const cellX = c * scaledCellSize + scaledCellSize / 2
              const cellY = r * scaledCellSize + scaledCellSize / 2
              const dx = mousePos.x - cellX
              const dy = mousePos.y - cellY
              const distance = Math.sqrt(dx * dx + dy * dy)
              const proximityFactor = Math.max(0, 1 - distance / scaledProximity)
              const isHovered = effectiveHoveredCell === index

              return (
                <div
                  key={index}
                  className="shrink-0 border transition-all duration-1000 ease-out"
                  style={{
                    width: scaledCellSize,
                    height: scaledCellSize,
                    borderColor: borderColor,
                    backgroundColor: isHovered
                      ? glowColor
                      : proximityFactor > 0
                        ? glowColor.replace(/[\d.]+\)$/, `${proximityFactor * 0.15})`)
                        : "transparent",
                    boxShadow: isHovered
                      ? `0 0 ${20 * grid.scale}px ${glowColor}, inset 0 0 ${10 * grid.scale}px ${glowColor.replace(/[\d.]+\)$/, "0.2)")}`
                      : "none",
                    transitionDuration: isHovered ? "0ms" : "1000ms",
                  }}
                  onMouseEnter={!isControlled ? () => setHoveredCell(index) : undefined}
                  onMouseLeave={!isControlled ? () => setHoveredCell(null) : undefined}
                />
              )
            })}
          </div>
        ))}
      </div>

      {/* Center ambient glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20"
        style={{
          width: "60vmin",
          height: "60vmin",
          background: `radial-gradient(circle, ${glowColor.replace(/[\d.]+\)$/, "0.3)")} 0%, transparent 70%)`,
        }}
      />

      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 0%, transparent 30%, rgba(5, 20, 40, 0.75) 100%)",
        }}
      />

      {/* Content layer */}
      {children && <div className="relative z-10 h-full w-full">{children}</div>}
    </div>
  )
}

export default function InteractiveGridPatternDemo() {
  return <InteractiveGridPattern />
}
