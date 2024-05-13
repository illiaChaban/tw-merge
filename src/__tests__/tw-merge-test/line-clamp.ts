import { describe } from "vitest";
import { TwMergeTest } from "./test-context";

export const testLineClamp: TwMergeTest = (it) => {
  describe("line-clamp", () => {
    it("line-clamp classes do create conflicts correctly", ({
      twMerge,
      expect,
    }) => {
      expect(twMerge("overflow-auto", "inline", "line-clamp-1")).toBe(
        "line-clamp-1"
      );
      expect(twMerge("line-clamp-1", "overflow-auto", "inline")).toBe(
        "line-clamp-1 overflow-auto inline"
      );
    });
  });
};
