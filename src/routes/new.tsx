import { createResource, Show } from "solid-js";
import { action, useAction, useNavigate } from "@solidjs/router";
import { getCookie } from "@solidjs/start/http";
import { api } from "../../convex/_generated/api";
import { createQuery } from "../lib/convex";
import { createPrediction as createPredictionToPds } from "~/server/createPrediction";
import { getSessionDid } from "~/lib/session";
import Button from "~/components/Button";
import PredictionForm from "../components/PredictionForm";
import type { PredictionFormValues } from "../components/PredictionForm";

const createPredictionAction = action(async (input: PredictionFormValues) => {
  "use server";

  const did = getCookie("did");
  if (!did) {
    throw new Error("Not logged in");
  }

  const { text, deadline, madeAt, attribution, source } = input;

  if (!text || text.length > 500) {
    throw new Error("Prediction text is required (max 500 chars)");
  }

  await createPredictionToPds(
    did,
    text,
    deadline || undefined,
    madeAt || undefined,
    attribution || undefined,
    source || undefined,
  );
}, "createPrediction");

export default function NewPrediction() {
  const createPrediction = useAction(createPredictionAction);
  const navigate = useNavigate();
  const [sessionDid] = createResource(() => getSessionDid());
  const user = createQuery(api.auth.getUser, () => ({ did: sessionDid() ?? "" }));

  const attributionPlaceholder = () => {
    const u = user();
    if (u) return `@${u.handle}`;
    const did = sessionDid();
    if (did) return did;
    return "";
  };

  return (
    <main class="max-w-2xl mx-auto p-4">
      <Show
        when={sessionDid()}
        fallback={
          <p>
            You must{" "}
            <Button variant="link" href="/oauth/login" class="px-0 inline">
              sign in
            </Button>{" "}
            to create a prediction.
          </p>
        }
      >
        <h1 class="text-2xl font-bold mb-4">New Prediction</h1>
        <PredictionForm
          onSubmit={async (values) => {
            await createPrediction(values);
            navigate("/");
          }}
          submitLabel="Create Prediction"
          submittingLabel="Creating..."
          attributionPlaceholder={attributionPlaceholder()}
        />
      </Show>
    </main>
  );
}
