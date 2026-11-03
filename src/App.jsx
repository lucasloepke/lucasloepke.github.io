import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./layout/AppLayout";
import { Home } from "./pages/Home";
import { Projects } from "./pages/Projects";
import { CommitArt } from "./pages/CommitArt";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="projects" element={<Projects />} />
          {/* Unlisted: not in nav or sitemap, noindex. URL access only. */}
          <Route path="commit-art" element={<CommitArt />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
