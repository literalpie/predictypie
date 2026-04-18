import { lexicons } from "@atproto/lexicon";

export const prediction = lexicons.createLexicon({
  id: "app.predictypie.prediction",
  defs: {
    main: {
      type: "record",
      key: "tid",
      record: {
        text: { type: "string", maxGraphemes: 500 },
        deadline: { type: "datetime", nullable: true },
      },
    },
  },
});