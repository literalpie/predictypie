import { createResource, Match, Switch, createEffect } from "solid-js";
import { loadPredictions } from "~/loadPredictions";

export default function Home() {
  const [predictions, { refetch }] = createResource(loadPredictions);
  return (
    <>
      <button onClick={refetch}>Refresh</button>
      {/* We get a hydration mismatch if the switch is used */}
      {/* <Switch>
        <Match when={predictions.state === "errored"}>
          Unable to fetch predictions. There could be something wrong with the server 
          or this app may have exceeded the BlueSky API limits.
          <pre>
          {predictions.error.message}
          </pre>
        </Match>
        <Match when={predictions.state === "pending" || predictions.state==='refreshing' || predictions.state === 'unresolved'}>Loading...</Match>
        <Match when={predictions.state === "ready"}>
        </Match>
      </Switch> */}
      {predictions()?.map((pred) => (
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
      ))}
    </>
  );
}
