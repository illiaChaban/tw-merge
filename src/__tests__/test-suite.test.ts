import { describe } from "vitest";
import { testPlugin } from "./tw-merge-postcss-plugin";
import { testTwMerge } from "./tw-merge";

describe("synchrounous test", () => {
  // generates config based on input css file
  testPlugin();
  // testTwMerge();
});
