import type { Project } from "../data/projects";
import { getSkill } from "../data/skills";
import { Chip } from "./Chip";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const { title, description, tech, links } = project;

  return (
    <article className="flex flex-col rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-all duration-150 hover:shadow-md hover:-translate-y-0.5 hover:scale-[1.04] dark:border-neutral-800 dark:bg-neutral-900">
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
        {title}
      </h3>
      <p className="mt-2 flex-1 text-sm text-neutral-600 dark:text-neutral-400">
        {description}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {tech.map((key) => {
          const skill = getSkill(key);
          if (!skill) return null;
          return (
            <Chip
              key={key}
              label={skill.label}
              iconSlug={skill.simpleIconSlug}
              customIconSvg={skill.customIconSvg}
              emoji={skill.emoji}
            />
          );
        })}
      </div>
      {(links?.github || links?.live) && (
        <div className="mt-4 flex flex-wrap gap-3">
          {links.github && (
            <a
              href={links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-accent transition-colors duration-150 hover:text-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 dark:focus:ring-offset-neutral-900"
            >
              Repository
            </a>
          )}
          {links.live && (
            <a
              href={links.live}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-accent transition-colors duration-150 hover:text-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 dark:focus:ring-offset-neutral-900"
            >
              Demo
            </a>
          )}
        </div>
      )}
    </article>
  );
}
