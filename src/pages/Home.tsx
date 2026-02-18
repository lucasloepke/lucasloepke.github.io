import { Link } from "react-router-dom";
import { Container } from "../components/Container";
import { SectionHeading } from "../components/SectionHeading";
import { Chip } from "../components/Chip";
import { ProjectCard } from "../components/ProjectCard";
import { UnderwaterBackground } from "../components/UnderwaterBackground";
import { projects } from "../data/projects";
import { getSkillsByCategory } from "../data/skills";

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
  return (
    <>
      <section className="relative py-16 sm:py-24 overflow-hidden">
        <UnderwaterBackground className="absolute inset-0 z-0" intensity={0.6} speed={0.8} />
        <div className="relative z-10 route-transition">
          <Container>
          <div className="max-w-2xl">
            <p className="text-base text-neutral-500 dark:text-neutral-400">
              Hi there,
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-4xl">
              I'm Lucas Loepke
            </h1>
            <p className="mt-4 text-neutral-600 dark:text-neutral-400">
             I'm a student at the University of Pittsburgh studying Computer Science and Economics. <br></br>
             Currently, I help build enterprise iOS apps at SAP.
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
                className="inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 transition-colors duration-150 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:focus:ring-offset-neutral-950"
              >
                View Resume
              </a>
            </div>
          </div>
        </Container>
        </div>
      </section>

      <div className="route-transition">
      <section className="border-t border-neutral-200 py-16 dark:border-neutral-800">
        <Container>
          <SectionHeading className="mb-8">About</SectionHeading>
          <div className="max-w-2xl space-y-4 text-neutral-600 dark:text-neutral-400">
            <p>
            I enjoy building reliable, well-structured software systems and care about clean architecture, performance, and writing code that scales beyond small demos. Most of my work centers on mobile development, backend systems, and applied AI.
            </p>
            <p>
            Outside of work and school, I build projects in game development and full-stack applications to strengthen my systems design and engineering skills.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-t border-neutral-200 py-16 dark:border-neutral-800">
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
      </section>

      <section className="border-t border-neutral-200 py-16 dark:border-neutral-800">
        <Container>
          <div className="mb-8 flex items-center justify-between gap-4">
            <SectionHeading>Featured Projects</SectionHeading>
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
      </section>
      </div>
    </>
  );
}
