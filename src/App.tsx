import { Title } from "@solidjs/meta";
import { Loading } from "solid-js";
import { isServer } from "@solidjs/web";
import { ConvexClient } from "convex/browser";
import "./app.css";
import Header from "./components/Header";
import { ConvexContext } from "./lib/convex";
import { Router } from "./router";

const convex = isServer ? null : new ConvexClient(import.meta.env.VITE_CONVEX_URL!);

export default function App() {
  return (
    <Router>
      {(props) => (
        <ConvexContext value={convex}>
          <Title>PredictyPie</Title>
          <Header />
          <Loading fallback={<main>Loading…</main>}>{props.children}</Loading>
        </ConvexContext>
      )}
    </Router>
  );
}
