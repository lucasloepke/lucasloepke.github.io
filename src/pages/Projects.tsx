import { Container } from "../components/Container";
import { Seo } from "../components/Seo";
import { SectionHeading } from "../components/SectionHeading";
import { Reveal } from "../components/Reveal";
import { ProjectFeature, hasProjectMedia } from "../components/ProjectFeature";
import { ProjectLinks, builtWith } from "../components/ProjectLinks";
import { projects } from "../data/projects";

const byYear = [...projects].sort((a, b) => b.year - a.year);
const visual = byYear.filter((p) => hasProjectMedia(p.slug));
const compact = byYear.filter((p) => !hasProjectMedia(p.slug));

export function Projects() {
  return (
    <div className="min-h-screen pb-16 pt-8 sm:pb-24 sm:pt-10">
      <Seo
        title="Projects | Lucas Loepke"
        description="Selected software projects by Lucas Loepke — machine learning, full-stack web apps, game development, and award-winning hackathon builds."
        path="/projects"
      />

      <Container>
        <div className="route-transition">
          <SectionHeading as="h1" className="mb-10">Projects</SectionHeading>
        </div>

        <div className="space-y-20 sm:space-y-28">
          {visual.map((project, index) => (
            <ProjectFeature key={project.slug} project={project} flip={index % 2 === 1} headingLevel="h2" showYear />
          ))}
        </div>

        <section className="mt-24 sm:mt-32">
          <Reveal>
            <SectionHeading className="mb-4">More projects</SectionHeading>
          </Reveal>
          <ul className="flex flex-col divide-y divide-neutral-800">
            {compact.map((project) => (
              <li key={project.slug}>
                <Reveal className="grid gap-x-8 gap-y-2 py-6 sm:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
                  <div>
                    <h3 className="font-semibold tracking-tight text-neutral-50">{project.title}</h3>
                    <p className="mt-1 text-sm tabular-nums text-neutral-400">{project.year}</p>
                    <p className="mt-1 text-sm font-medium text-neutral-200">{project.outcome}</p>
                  </div>
                  <div>
                    <p className="text-sm leading-relaxed text-neutral-400">{project.description}</p>
                    <p className="mt-2 text-sm text-neutral-400">{builtWith(project)}</p>
                    <ProjectLinks project={project} />
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>
      </Container>
    </div>
  );
}
