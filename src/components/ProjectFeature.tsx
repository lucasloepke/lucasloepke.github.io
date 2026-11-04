import type { ReactNode } from "react";
import type { Project } from "../data/projects";
import { CommitArtPreview } from "./CommitArtPreview";
import { ProjectLinks, builtWith } from "./ProjectLinks";
import { Reveal } from "./Reveal";

const STEAM_CAPSULE =
  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4801800/e3983c5c09bd42a27f4aac058fd8cb92126dd6d1/header.jpg";

const mediaFrame =
  "w-full rounded-2xl shadow-[0_24px_60px_-24px_rgba(0,0,0,0.7)] ring-1 ring-white/10";

const projectMedia: Record<string, ReactNode> = {
  "simple-canvas-tasks": (
    <img
      src="/projects/canvas-tasks.jpg"
      alt="Simple Canvas Tasks on the Canvas dashboard: a tabbed To Do panel listing assignments with color-coded time until due"
      width={1278}
      height={800}
      loading="lazy"
      className={`${mediaFrame} aspect-[16/10] object-cover`}
    />
  ),
  "cleanup-crew": (
    <img
      src={STEAM_CAPSULE}
      alt="Cleanup Crew's Steam capsule: the title in gold over a spiral galaxy"
      width={460}
      height={215}
      loading="lazy"
      className={mediaFrame}
    />
  ),
  "commit-art": <CommitArtPreview />,
  leetvision: (
    <img
      src="/projects/leetvision.png"
      alt="LeetVision: a side panel beside the NeetCode editor, stepping through a Two Sum solution with its arrays and variables drawn out"
      width={938}
      height={586}
      loading="lazy"
      className={`${mediaFrame} aspect-[16/10] object-cover`}
    />
  ),
  flowle: (
    <img
      src="/projects/flowle.jpg"
      alt="Flowle: a glowing five by five puzzle board with colored pipes connecting matching dots"
      width={1200}
      height={750}
      loading="lazy"
      className={`${mediaFrame} aspect-[16/10] object-cover`}
    />
  ),
};

export function hasProjectMedia(slug: string) {
  return slug in projectMedia;
}

interface ProjectFeatureProps {
  project: Project;
  /** Puts the image on the right from tablet width up. */
  flip?: boolean;
  headingLevel?: "h2" | "h3";
  showYear?: boolean;
}

/** A project shown large, with its image beside the details. */
export function ProjectFeature({ project, flip = false, headingLevel: Heading = "h3", showYear = false }: ProjectFeatureProps) {
  return (
    <article className={`grid items-center gap-8 md:gap-12 ${flip ? "md:grid-cols-[5fr_7fr]" : "md:grid-cols-[7fr_5fr]"}`}>
      <Reveal className={`min-w-0 ${flip ? "md:order-2" : ""}`}>{projectMedia[project.slug]}</Reveal>
      <Reveal delay={120} className={`min-w-0 ${flip ? "md:order-1" : ""}`}>
        <Heading className="text-2xl font-semibold tracking-tight text-neutral-50">{project.title}</Heading>
        {showYear && <p className="mt-1 text-sm tabular-nums text-neutral-400">{project.year}</p>}
        <p className="mt-2 font-medium text-neutral-200">{project.outcome}</p>
        <p className="mt-3 text-sm leading-relaxed text-neutral-400">{project.description}</p>
        <p className="mt-3 text-sm text-neutral-400">{builtWith(project)}</p>
        <div className="mt-2">
          <ProjectLinks project={project} />
        </div>
      </Reveal>
    </article>
  );
}
