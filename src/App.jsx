import { HashRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./layout/AppLayout";
import { Home } from "./pages/Home";
import { Projects } from "./pages/Projects";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="projects" element={<Projects />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
