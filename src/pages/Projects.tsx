import { Container } from "../components/Container";
import { SectionHeading } from "../components/SectionHeading";
import { ProjectCard } from "../components/ProjectCard";
import { projects } from "../data/projects";

export function Projects() {
  return (
    <div className="pt-8 pb-12 sm:pt-10 sm:pb-16">
      <Container>
        <SectionHeading className="mb-10">Projects</SectionHeading>
        <div className="grid gap-6 sm:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </Container>
    </div>
  );
}
