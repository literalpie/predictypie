import { ErrorBoundary, Suspense } from "solid-js";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import "./app.css";

export default function App() {
  return (
    <main>
      <header>
        <h1>PredictyPie</h1>
      </header>
      <ErrorBoundary fallback="An error occurred">
        <Router
          root={(props) => (
            <Suspense fallback="Loading Route">{props.children}</Suspense>
          )}
        >
          <FileRoutes />
        </Router>

      </ErrorBoundary>
    </main>
  );
}
