import { describe, it, expect } from "vitest";
import { Config, TwMergeFn, createTwMerge } from "../../tw-merge";
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
import { testPseudoClasses } from "./pseudo-classes";
import { testLineClamp } from "./line-clamp";
import { testTouchClasses } from "./touch-classes";

export const testTwMerge = (getConfig: () => Promise<Config>) =>
  describe("tw-merge", () => {
    let twMerge: ReturnType<typeof createTwMerge>;

    it("should create tw-merge", async () => {
      const config = await getConfig();
      expect(Object.keys(config).includes("p-2")).toBe(true);
      twMerge = createTwMerge(config);
      expect(twMerge).toBeTypeOf("function");
    });

    // Extended test to access twMerge in other tests through context
    const contextTest = it.extend<{ twMerge: TwMergeFn }>({
      twMerge: async ({}, use) => {
        await use(twMerge);
      },
    });

    // tw merge test cases
    [
      testBasicFunctionality,
      testConflicts,
      testMergeChunks,
      testPseudoClasses,
      testStandaloneClasses,
      testCustomPlugins,
      testFalsyValues,
      testArbitraryProperties,
      testImportantModifier,
      testPrefixModifiers,
      testArbitraryValues,
      testLineClamp,
      testTouchClasses,
    ].forEach((t) => t(contextTest));

    // TODO: adjust for value

    // In order to sequentially access newly create tw-merge, it needs to be inside another test block
    // testArbitraryValues(() => twMerge))

    /** Arbitrary values */

    // TODO

    // This might be ok to not support since 1 string is not checked
    // it("ring and shadow classes do not create conflict", () => {
    //   expect(twMerge("ring", "shadow")).toBe("ring shadow");
    //   expect(twMerge("ring-2", "shadow-md")).toBe("ring-2 shadow-md");
    //   expect(twMerge("shadow", "ring")).toBe("shadow ring");
    //   expect(twMerge("shadow-md", "ring-2")).toBe("shadow-md ring-2");
    // });

    // test('handles pseudo variant group conflicts properly', () => {
    //     expect(twMerge('group-empty:p-2 group-empty:p-3')).toBe('group-empty:p-3')
    //     expect(twMerge('peer-empty:p-2 peer-empty:p-3')).toBe('peer-empty:p-3')
    //     expect(twMerge('group-empty:p-2 peer-empty:p-3')).toBe('group-empty:p-2 peer-empty:p-3')
    //     expect(twMerge('hover:group-empty:p-2 hover:group-empty:p-3')).toBe('hover:group-empty:p-3')
    //     expect(twMerge('group-read-only:p-2 group-read-only:p-3')).toBe('group-read-only:p-3')
    // })
  });
