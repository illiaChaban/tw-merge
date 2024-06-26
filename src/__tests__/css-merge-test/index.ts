import { describe, it, expect } from "vitest";
import { CompressedConfig, CssMergeFn, createCssMerge } from "../../css-merge";
import { testArbitraryValues } from "./arbitrary-values";
import { testArbitraryProperties } from "./arbitrary-properties";
import { testImportantModifier } from "./important-modifer";
import { testCustomPlugins } from "./custom-plugins";
import { testFalsyValues } from "./falsy-values";
import { testPrefixModifiers } from "./prefix-modifiers";
import { testStandaloneClasses } from "./standalone-classes";
import { testMergeChunks } from "./merging-chunks";
import { testBasicFunctionality } from "./basic-functionality";
import { testConflicts } from "./conflicts";
import { testPseudoVariants } from "./pseudo-variants";
import { testLineClamp } from "./line-clamp";
import { testClassGroupsConflicts } from "./class-groups-conflicts";
import { testPseudoElements } from "./pseudo-elements";

export const testTwMerge = (getConfig: () => Promise<CompressedConfig>) =>
  describe("tw-merge", () => {
    let twMerge: ReturnType<typeof createCssMerge>;

    it("should create tw-merge", async () => {
      const config = await getConfig();
      expect(Object.keys(config).includes("p-2")).toBe(true);
      twMerge = createCssMerge(config);
      expect(twMerge).toBeTypeOf("function");
    });

    // Extended test to access twMerge in other tests through context
    const contextTest = it.extend<{ twMerge: CssMergeFn }>({
      twMerge: async ({}, use) => {
        await use(twMerge);
      },
    });

    // tw merge test cases
    [
      testBasicFunctionality,
      testConflicts,
      testPseudoElements,
      testMergeChunks,
      testPseudoVariants,
      testStandaloneClasses,
      testCustomPlugins,
      testFalsyValues,
      testArbitraryProperties,
      testImportantModifier,
      testPrefixModifiers,
      testArbitraryValues,
      testLineClamp,
      testClassGroupsConflicts,
    ].forEach((t) => t(contextTest));
  });
