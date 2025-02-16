import { ErrorBoundary, Suspense } from "solid-js";
import { createResource } from "solid-js";
import { loadPredictions } from "~/loadPredictions";

const PredictionsList = () => {
  const [predictions, { refetch }] = createResource(loadPredictions);
  // I would expect to be able to use predictions.error with Switch or Show,
  // but that causes a hydration mismatch error. 
  // Work around it by wrapping the component in suspense and error boundary.
  return (
    <>
      <button onClick={refetch}>Refresh</button>
      {predictions()?.map((pred) => (
        <div>
          {pred.record.text}{" "}
          <a
            href={`https://bsky.app/profile/${
              pred.author.handle
            }/post/${pred.uri.split("/").at(-1)}`}
          >
            View on Bluesky
          </a>
        </div>
      ))}
    </>
  );
};

export default function Home() {
  return (
    <Suspense fallback="Loading Predictions">
      <ErrorBoundary
        fallback={
          <>
            Unable to fetch predictions. There could be something wrong with the
            server or this app may have exceeded the BlueSky API limits.
          </>
        }
      >
        <PredictionsList />
      </ErrorBoundary>
    </Suspense>
  );
}
