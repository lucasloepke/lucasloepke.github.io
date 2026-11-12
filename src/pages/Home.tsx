import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { Container } from "../components/Container";
import { Seo } from "../components/Seo";
import { SectionHeading } from "../components/SectionHeading";
import { Reveal } from "../components/Reveal";
import { ProjectFeature } from "../components/ProjectFeature";
import { HoverGrid } from "../components/HoverGrid";
import { ScrollHint } from "../components/ScrollHint";
import { projects } from "../data/projects";
import { experience, education } from "../data/experience";

const EMAIL = "lucasloepke@gmail.com";
const featuredSlugs = ["simple-canvas-tasks", "cleanup-crew", "commit-art"];

export function Home() {
  const photoRef = useRef<HTMLImageElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const [photoReady, setPhotoReady] = useState(false);

  // Hold the photo's entrance until it has downloaded and the tab is in front;
  // otherwise a cold load or a background tab plays it to nobody.
  useEffect(() => {
    const img = photoRef.current;
    if (!img) return;
    const whenVisible = () => {
      if (document.visibilityState === "visible") setPhotoReady(true);
      else document.addEventListener("visibilitychange", whenVisible, { once: true });
    };
    if (img.complete) whenVisible();
    else {
      img.addEventListener("load", whenVisible, { once: true });
      img.addEventListener("error", whenVisible, { once: true });
    }
    return () => {
      img.removeEventListener("load", whenVisible);
      img.removeEventListener("error", whenVisible);
      document.removeEventListener("visibilitychange", whenVisible);
    };
  }, []);

  // The hero drifts apart and fades as it scrolls away.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = Math.min(window.scrollY, 800);
      if (photoRef.current) {
        photoRef.current.style.transform = `translate3d(0, ${y * 0.14}px, 0)`;
        photoRef.current.style.opacity = String(Math.max(1 - y / 640, 0));
      }
      if (introRef.current) {
        introRef.current.style.transform = `translate3d(0, ${y * 0.06}px, 0)`;
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <>
      <Seo
        title="Lucas Loepke - Software Engineer | Portfolio & Resume"
        description="Lucas Loepke - Software Engineer at SAP and Computer Science student at University of Pittsburgh."
        path="/"
      />

      <section className="relative overflow-hidden">
        {/* The fade lives on the picture so it stays put while the photo drifts inside it. */}
        <picture className={`${photoReady ? "hero-photo" : "opacity-0"} relative block h-80 [mask-image:linear-gradient(to_bottom,black_70%,transparent)] md:absolute md:inset-y-0 md:left-[calc(50%-4rem)] md:right-0 md:h-auto md:[mask-composite:intersect] md:[mask-image:linear-gradient(to_right,transparent,black_38%),linear-gradient(to_bottom,black_84%,transparent)]`}>
          <source media="(max-width: 767px)" srcSet="/portrait.webp" type="image/webp" />
          <img
            ref={photoRef}
            src="/portrait-hd.jpg"
            alt="Lucas Loepke on a Yamaha R7 motorcycle"
            width={1700}
            height={2550}
            // From md up, the top 27% of the photo sits above the hero at any window size, leaving the helmet just below the navbar.
            className="h-full w-full object-cover object-[50%_55%] will-change-transform md:ml-[calc((100%-var(--photo-w))/2)] md:mt-[calc(var(--photo-w)*-0.405)] md:h-auto md:w-[var(--photo-w)] md:max-w-none md:[--photo-w:max(100%,40.5rem,calc((100svh-73px)*1.122))]"
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
        </picture>

        {/* The hero runs past the first screen so the photo's fade starts below the fold; the intro stays centered on that screen. */}
        <Container className="relative md:min-h-[max(44rem,calc((100svh-73px)*1.22))]">
          <div ref={introRef} className="relative pb-16 pt-4 will-change-transform md:flex md:h-[max(36rem,calc(100svh-73px))] md:items-center md:py-0">
            <div>
              <h1 className="hero-line text-4xl font-semibold tracking-tight text-neutral-50 sm:text-5xl">
                Lucas Loepke
              </h1>
              <p style={{ "--line": 1 } as CSSProperties} className="hero-line mt-4 text-lg text-neutral-200/75 md:text-base lg:text-lg">
                Computer Science & Economics @ Pitt{" "}
                <br />
                Software Engineer Intern @ SAP
              </p>
              <div style={{ "--line": 2 } as CSSProperties} className="hero-line mt-8 flex flex-wrap items-center gap-3">
                <Link to="/projects" className="glass-button glass-button-primary">
                  <span>View Projects</span>
                </Link>
                <a
                  href="/Loepke_Resume.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-button"
                >
                  <span>View Resume</span>
                </a>
                <a
                  href={`mailto:${EMAIL}`}
                  className="inline-flex min-h-11 items-center px-2 text-sm font-medium text-accent-text transition-colors duration-150 hover:text-white"
                >
                  Email me
                </a>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <ScrollHint targetId="about" />

      <section id="about" className="relative scroll-mt-20 py-16 md:-mt-24">
        <Container>
          <Reveal>
            <SectionHeading className="mb-8">About</SectionHeading>
            <div className="max-w-[40rem] space-y-4 leading-relaxed text-neutral-200/75">
              <p>
                I started writing code <span className="font-medium text-white">over a decade ago</span>, building Minecraft mini-game servers that actually turned a profit. I've spent the last three years interning across three rotations at{" "}
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
                I'm finishing my CS degree at Pitt and looking for <span className="font-medium text-white">new-grad SWE roles</span>, open to start as early as <span className="font-medium text-white">June 2027</span>. Outside of work I ski, ride motorcycles, love trying new teas, and build cool projects.
              </p>
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="py-16 sm:py-24">
        <Container>
          <Reveal className="mb-12 flex items-center justify-between gap-4">
            <SectionHeading>Featured Projects</SectionHeading>
            <Link
              to="/projects"
              className="inline-flex min-h-11 items-center text-sm font-medium text-accent-text transition-colors duration-150 hover:text-white"
            >
              View all <span className="link-arrow ml-1" aria-hidden>→</span>
            </Link>
          </Reveal>

          <div className="space-y-20 sm:space-y-28">
            {featuredSlugs.map((slug, index) => {
              const project = projects.find((p) => p.slug === slug);
              return project ? <ProjectFeature key={slug} project={project} flip={index % 2 === 1} /> : null;
            })}
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <Reveal>
            <SectionHeading className="mb-6">Experience</SectionHeading>
          </Reveal>

          <ul className="flex flex-col divide-y divide-neutral-800">
            {experience.map((entry, index) => (
              <li key={entry.id}>
                <Reveal
                  delay={index * 80}
                  className="grid grid-cols-1 gap-x-8 gap-y-1 rounded-lg px-4 py-5 transition-colors duration-150 hover:bg-accent/10 sm:grid-cols-[11rem_1fr]"
                >
                  <div className="flex items-baseline justify-between gap-x-3 text-sm text-neutral-400 sm:block">
                    <span className="whitespace-nowrap">{entry.dates}</span>
                    <span className="whitespace-nowrap sm:hidden">{entry.location}</span>
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                      <h3 className="inline-flex items-center gap-2 font-semibold text-neutral-100">
                        {entry.logoSrc && (
                          <a href={entry.companyUrl} target="_blank" rel="noopener noreferrer" aria-label={entry.company}>
                            <img src={entry.logoSrc} alt="" width={28} height={28} className="h-7 w-7 shrink-0 object-contain" />
                          </a>
                        )}
                        {entry.title}
                      </h3>
                      <span className="hidden text-sm text-neutral-400 sm:inline">{entry.location}</span>
                    </div>
                    <div className="mt-1 text-sm text-neutral-400">
                      {entry.role}
                      <span className="mx-1.5 text-neutral-600">·</span>
                      {entry.detail}
                    </div>
                    <p className="mt-2 max-w-[38rem] text-sm leading-relaxed text-neutral-200/75">{entry.outcome}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>

          <p className="mt-6 px-4 text-sm">
            <svg
              viewBox="0 0 16 16"
              className="mr-1.5 inline-block h-3.5 w-3.5 align-[-0.125em] text-neutral-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M3 2v5.5a3 3 0 0 0 3 3h7.5M10.5 7.5l3 3-3 3" />
            </svg>
            <a
              href={education.schoolUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 underline decoration-transparent underline-offset-2 transition-colors hover:decoration-amber-400"
            >
              {education.school}
            </a>
            <span className="text-neutral-400">, </span>
            <span className="text-neutral-200">{education.degree}</span>
            <span className="text-neutral-400">
              {" · "}
              {education.date}
            </span>
          </p>
        </Container>
      </section>

      <section className="relative mx-auto max-w-4xl overflow-hidden py-24 text-center sm:py-32">
        <HoverGrid className="absolute inset-0" />
        <Container className="relative">
          <Reveal>
            <h2 className="text-2xl font-semibold tracking-tight text-neutral-50 sm:text-3xl">
              Hiring for June 2027?
            </h2>
            <a
              href={`mailto:${EMAIL}`}
              className="mt-3 inline-flex min-h-11 items-center text-lg font-medium text-accent-text transition-colors duration-150 hover:text-white"
            >
              {EMAIL}
            </a>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
