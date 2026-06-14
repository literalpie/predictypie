import { createResource, Show } from "solid-js";
import { action, useAction, useNavigate, useParams } from "@solidjs/router";
import { getCookie } from "@solidjs/start/http";
import { api } from "../../../convex/_generated/api";
import { createQuery } from "../../lib/convex";
import { updatePrediction as updatePredictionOnPds } from "~/server/createPrediction";
import { getSessionDid } from "~/lib/session";
import PredictionForm from "../../components/PredictionForm";
import type { PredictionFormValues } from "../../components/PredictionForm";

const updatePredictionAction = action(async (input: PredictionFormValues & { rkey: string }) => {
  "use server";

  const did = getCookie("did");
  if (!did) throw new Error("Not logged in");

  const { rkey, text, deadline, madeAt, attribution, source } = input;

  if (!text || text.length > 500) {
    throw new Error("Prediction text is required (max 500 chars)");
  }

  const atUri = `at://${did}/app.predictypie.prediction/${rkey}`;

  await updatePredictionOnPds(did, atUri, {
    text,
    deadline: deadline || undefined,
    madeAt: madeAt || undefined,
    attribution: attribution || undefined,
    source: source || undefined,
  });
}, "updatePrediction");

export default function EditPrediction() {
  const params = useParams();
  const id = () => params.id!;
  const updatePrediction = useAction(updatePredictionAction);
  const navigate = useNavigate();
  const [sessionDid] = createResource(() => getSessionDid());
  const prediction = createQuery(api.predictions.getPrediction, () => ({ rkey: id() }));

  const isAuthor = () => {
    const sd = sessionDid();
    const p = prediction();
    if (!sd || !p) return false;
    return sd === p.authorDid;
  };

  return (
    <main class="max-w-2xl mx-auto p-4">
      <Show when={prediction()} fallback={<p class="text-zinc-500">Loading...</p>}>
        <Show
          when={isAuthor()}
          fallback={<p class="text-zinc-500">You don't have permission to edit this prediction.</p>}
        >
          <h1 class="text-2xl font-bold mb-4">Edit Prediction</h1>
          <PredictionForm
            defaultValues={{
              text: prediction()!.text,
              deadline: prediction()!.deadline?.split("T")[0] ?? "",
              madeAt: prediction()!.madeAt?.split("T")[0] ?? "",
              attribution: prediction()!.attribution ?? "",
              source: prediction()!.source ?? "",
            }}
            onSubmit={async (values) => {
              await updatePrediction({
                ...values,
                rkey: id(),
              });
              navigate("/");
            }}
            submitLabel="Save Changes"
            submittingLabel="Saving..."
          />
        </Show>
      </Show>
    </main>
  );
}
