import { describe, expect } from "vitest";
import { TwMergeTest } from "./test-context";

export const testImportantModifier: TwMergeTest = (it) => {
  describe("important modifier", () => {
    it("merges tailwind classes with important modifier correctly", ({
      twMerge,
    }) => {
      expect(twMerge("!font-medium", "!font-bold")).toBe("!font-bold");
      expect(twMerge("!font-medium", "!font-bold", "font-thin")).toBe(
        "!font-bold font-thin"
      );
      expect(twMerge("!right-2", "!-inset-x-px")).toBe("!-inset-x-px");
      expect(twMerge("focus:!inline", "focus:!block")).toBe("focus:!block");
    });

    it("keeps the last class with important modifer even if it's overriden by non-important class later", ({
      twMerge,
    }) => {
      expect(twMerge("![display:block]", "[display:inherit]")).toBe(
        "![display:block] [display:inherit]"
      );
      expect(
        twMerge(
          "![display:block]",
          "[display:inherit]",
          "[display:inline]",
          "![display:inline-block]"
        )
      ).toBe("![display:inline-block]");
    });
  });
};
