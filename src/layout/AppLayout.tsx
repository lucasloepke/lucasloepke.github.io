import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { UnderwaterBackground } from "../components/UnderwaterBackground";

export function AppLayout() {
  const location = useLocation();

  useEffect(() => {
    // Ensure each new route starts at the top of the page
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-[#0b1220]">
      <UnderwaterBackground className="fixed inset-0 z-0" intensity={0.6} speed={0.8} />
      <a
        href="#main"
        className="sr-only z-[60] rounded-lg bg-white px-4 py-3 text-sm font-medium text-neutral-900 focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <div className="relative z-10 flex flex-1 flex-col">
        <Header />
        <main id="main" tabIndex={-1} className="flex-1 outline-none">
          <div key={location.pathname} className="h-full">
            <Outlet />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
