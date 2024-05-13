import { describe } from "vitest";
import { TwMergeTest } from "./test-context";

export const testPseudoElements: TwMergeTest = (it) => {
  describe("pseudo elements", () => {
    it("merges 'after' classes with equal values for 'content'r", ({
      twMerge,
      expect,
    }) => {
      expect(twMerge("after:absolute", "after:left-0")).toBe(
        "after:absolute after:left-0"
      );
      expect(twMerge("after:left-0", "after:absolute")).toBe(
        "after:left-0 after:absolute"
      );
    });
  });
};
