import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

export function AppLayout() {
  const location = useLocation();

  useEffect(() => {
    // Ensure each new route starts at the top of the page
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-[#0b1220]">
      <Header />
      <main className="flex-1">
        <div key={location.pathname} className="h-full">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}
