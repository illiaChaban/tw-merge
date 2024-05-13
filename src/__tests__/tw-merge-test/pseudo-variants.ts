import { describe } from "vitest";
import { TwMergeTest } from "./test-context";

export const testPseudoVariants: TwMergeTest = (it) => {
  describe("pseud variants", () => {
    it("handles pseudo variants conflicts properly", ({ twMerge, expect }) => {
      expect(twMerge("empty:p-2", "empty:p-3")).toBe("empty:p-3");
      expect(twMerge("empty:p-3", "empty:p-2")).toBe("empty:p-2");
      expect(twMerge("hover:empty:p-2", "hover:empty:p-3")).toBe(
        "hover:empty:p-3"
      );
      expect(twMerge("read-only:p-2", "read-only:p-3")).toBe("read-only:p-3");
    });

    it("handles pseudo variant group conflicts properly", ({
      twMerge,
      expect,
    }) => {
      expect(twMerge("group-empty:p-2", "group-empty:p-3")).toBe(
        "group-empty:p-3"
      );
      expect(twMerge("peer-empty:p-2", "peer-empty:p-3")).toBe(
        "peer-empty:p-3"
      );
      expect(twMerge("group-empty:p-2", "peer-empty:p-3")).toBe(
        "group-empty:p-2 peer-empty:p-3"
      );
      expect(twMerge("hover:group-empty:p-2", "hover:group-empty:p-3")).toBe(
        "hover:group-empty:p-3"
      );
      expect(twMerge("group-read-only:p-2", "group-read-only:p-3")).toBe(
        "group-read-only:p-3"
      );
    });
  });
};
