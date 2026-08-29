import { useCallback, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Container } from "../components/Container";
import { SectionHeading } from "../components/SectionHeading";
import { Chip } from "../components/Chip";
import { ProjectCard } from "../components/ProjectCard";
import { UnderwaterBackground } from "../components/UnderwaterBackground";
import { InteractiveGridPattern } from "../components/InteractiveGridPattern";
import { projects } from "../data/projects";
import { getSkillsByCategory } from "../data/skills";

const OFF_SCREEN = { x: -1000, y: -1000 };

const featuredProjects = projects.filter((p) => p.featured).slice(0, 3);
const skillsByCategory = getSkillsByCategory();
const categoryOrder = [
  "Languages",
  "Frameworks",
  "Tools",
  "AI, Copilots & SDKs",
  "Other",
] as const;

export function Home() {
  const gridSectionRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(OFF_SCREEN);

  const handleGridMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = gridSectionRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  const handleGridMouseLeave = useCallback(() => {
    setMousePosition(OFF_SCREEN);
  }, []);

  return (
    <>
      <div className="relative overflow-hidden">
        <UnderwaterBackground className="absolute inset-0 z-0" intensity={0.6} speed={0.8} />

        <section className="relative z-10 py-16 sm:py-24 overflow-hidden">
          <div className="route-transition">
            <Container>
              <div className="max-w-2xl">
                <p className="text-base text-neutral-200/70"></p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutral-50 sm:text-4xl">
                  Lucas Loepke
                </h1>
                <p className="mt-4 text-neutral-200/75">
                  Computer Science & Economics @ Pitt{" "}
                  <br />
                  Building agentic AI systems and enterprise tooling @ SAP
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    to="/projects"
                    className="inline-flex items-center justify-center rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 dark:focus:ring-offset-neutral-950"
                  >
                    View Projects
                  </Link>
                  <a
                    href="/resume.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-medium text-neutral-50 transition-colors duration-150 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 dark:focus:ring-offset-neutral-950"
                  >
                    View Resume
                  </a>
                </div>
              </div>
            </Container>
          </div>
        </section>

        <section className="relative z-10 py-16">
          <div className="route-transition">
            <Container>
              <SectionHeading className="mb-8 text-white">About</SectionHeading>
              <div className="max-w-[40rem] space-y-4 text-neutral-200/75">
                <p>
                  I started writing code{" "}
                  <span className="rounded-[2px] bg-accent/25 px-1 py-0.5 font-medium text-white shadow-[0_0_0_1px_rgba(255,255,255,0.04)] [box-decoration-break:clone] [-webkit-box-decoration-break:clone]">over a decade ago</span> — my first projects were Minecraft mini-game servers that actually turned a profit. I've spent the last{" "}
                  <span className="rounded-[2px] bg-accent/25 px-1 py-0.5 font-medium text-white shadow-[0_0_0_1px_rgba(255,255,255,0.04)] [box-decoration-break:clone] [-webkit-box-decoration-break:clone]">three years</span>{" "}
                  interning across three rotations at{" "}
                  <a
                    href="https://sap.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-white/40 underline-offset-2 transition-colors hover:decoration-white"
                  >
                    SAP
                  </a>
                  , moving from internal analytics tooling to full-stack iOS development to now building agentic AI platforms for enterprise customers.
                </p>
                <p>
                  I'm finishing my CS degree at Pitt and looking for{" "}
                  <span className="rounded-[2px] bg-accent/25 px-1 py-0.5 font-medium text-white shadow-[0_0_0_1px_rgba(255,255,255,0.04)] [box-decoration-break:clone] [-webkit-box-decoration-break:clone]">new-grad SWE roles</span> in SF or NYC — open to start as early as{" "}
                  <span className="rounded-[2px] bg-accent/25 px-1 py-0.5 font-medium text-white shadow-[0_0_0_1px_rgba(255,255,255,0.04)] [box-decoration-break:clone] [-webkit-box-decoration-break:clone]">June 2027</span>. Outside of work I ski, ride motorcycles, love trying new teas, and build cool projects.
                </p>
              </div>
            </Container>
          </div>
        </section>

        {/* Taper off aquatic background after About */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-b from-transparent to-white dark:to-[#0b1220]" />
      </div>

      <section className="py-16">
        <div className="route-transition">
          <Container>
            <SectionHeading className="mb-8">Skills</SectionHeading>
            <div className="flex flex-col gap-10">
              {categoryOrder.map((category) => {
                const list = skillsByCategory.get(category);
                if (!list?.length) return null;
                return (
                  <div key={category}>
                    <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                      {category}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {list.map((skill) => (
                        <Chip
                          key={skill.key}
                          label={skill.label}
                          iconSlug={skill.simpleIconSlug}
                          customIconSvg={skill.customIconSvg}
                          emoji={skill.emoji}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Container>
        </div>
      </section>

      <section
        ref={gridSectionRef}
        className="relative py-16 sm:py-24 overflow-hidden"
        onMouseMove={handleGridMouseMove}
        onMouseLeave={handleGridMouseLeave}
      >
        <InteractiveGridPattern className="absolute inset-0 z-0" mousePosition={mousePosition} />
        <div className="route-transition">
          <Container className="relative z-10 text-neutral-100">
            <div className="mb-8 flex items-center justify-between gap-4">
              <SectionHeading className="text-white">Featured Projects</SectionHeading>
              <Link
                to="/projects"
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-accent transition-all duration-150 hover:bg-neutral-100 hover:text-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 dark:hover:bg-neutral-800 dark:focus:ring-offset-neutral-950"
              >
                View all →
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProjects.map((project) => (
                <ProjectCard key={project.slug} project={project} />
              ))}
            </div>
          </Container>
        </div>
      </section>
    </>
  );
}
