import { useCallback, useRef, useState } from "react";
import { Container } from "../components/Container";
import { SectionHeading } from "../components/SectionHeading";
import { ProjectCard } from "../components/ProjectCard";
import { InteractiveGridPattern } from "../components/InteractiveGridPattern";
import { projects } from "../data/projects";

const OFF_SCREEN = { x: -1000, y: -1000 };

export function Projects() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(OFF_SCREEN);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = wrapperRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMousePosition(OFF_SCREEN);
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="relative min-h-screen overflow-hidden pt-8 pb-12 sm:pt-10 sm:pb-16"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <InteractiveGridPattern className="absolute inset-0 z-0" mousePosition={mousePosition} />
      <div className="relative z-10 route-transition">
      <Container className="text-neutral-100">
        <SectionHeading className="mb-10 text-neutral-100">Projects</SectionHeading>
        <div className="grid gap-6 sm:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </Container>
      </div>
    </div>
  );
}
