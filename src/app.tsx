import { Suspense } from "solid-js";
import { createAsync } from "@solidjs/router";
import "./app.css";
import { loadPredictions } from "./loadPredictions";

export default function App() {
  const predictions = createAsync(loadPredictions);
  return (
    <main>
      <Suspense fallback="loading something...">
        {predictions()?.map((pred) => (
          <>
            <div>
              {pred.record.text}{" "}
              <a
                href={`https://bsky.app/profile/${
                  pred.author.handle
                }/post/${pred.uri.split("/").at(-1)}`}
              >
                post
              </a>
            </div>
          </>
        ))}
      </Suspense>
    </main>
  );
}
