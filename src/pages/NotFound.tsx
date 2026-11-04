import { Link } from "react-router-dom";
import { Container } from "../components/Container";

export function NotFound() {
  return (
    <section className="py-24 sm:py-32">
      <title>Page not found | Lucas Loepke</title>
      <meta name="robots" content="noindex, nofollow" />
      <Container className="route-transition">
        <h1 className="text-4xl font-semibold tracking-tight text-neutral-50 sm:text-5xl">Page not found</h1>
        <p className="mt-4 max-w-[34rem] text-lg text-neutral-200/75">
          Nothing lives at this address. It may have moved, or the link may have a typo.
        </p>
        <p className="mt-6 flex flex-wrap gap-x-6 text-sm font-medium">
          <Link to="/" className="inline-flex min-h-11 items-center text-accent-text transition-colors duration-150 hover:text-white">Back to home</Link>
          <Link to="/projects" className="inline-flex min-h-11 items-center text-accent-text transition-colors duration-150 hover:text-white">See all projects</Link>
        </p>
      </Container>
    </section>
  );
}
