import { Link } from "react-router-dom";
import type { Project } from "../data/projects";
import { getSkill } from "../data/skills";

const linkClass =
  "inline-flex min-h-11 items-center text-sm font-medium text-accent-text transition-colors duration-150 hover:text-white";

export function builtWith(project: Project) {
  return project.tech
    .map((key) => getSkill(key)?.label)
    .filter(Boolean)
    .join(", ");
}

export function ProjectLinks({ project }: { project: Project }) {
  const { links, liveLabel, title } = project;
  return (
    <p className="flex flex-wrap gap-x-5">
      {links?.live?.startsWith("/") && (
        <Link to={links.live} aria-label={`${liveLabel}: ${title}`} className={linkClass}>
          {liveLabel}
        </Link>
      )}
      {links?.live && !links.live.startsWith("/") && (
        <a
          href={links.live}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${liveLabel}: ${title}`}
          className={linkClass}
        >
          {liveLabel}
        </a>
      )}
      {links?.github && (
        <a
          href={links.github}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${title} source code on GitHub`}
          className={linkClass}
        >
          Source code
        </a>
      )}
    </p>
  );
}
