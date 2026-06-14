import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import "./app.css";
import { ConvexClient } from "convex/browser";
import { ConvexContext } from "./lib/convex";
import Header from "./components/Header";

const convex = new ConvexClient(import.meta.env.VITE_CONVEX_URL!);

export default function App() {
  return (
    <Router
      root={(props) => (
        <ConvexContext.Provider value={convex}>
          <MetaProvider>
            <Title>PredictyPie</Title>
            <Header />
            <Suspense>{props.children}</Suspense>
          </MetaProvider>
        </ConvexContext.Provider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
