import { describe } from "vitest";
import { TwMergeTest } from "./test-context";

export const testBasicFunctionality: TwMergeTest = (it) => {
  describe("basic functionality", () => {
    it("should not remove less specific styles", ({ twMerge, expect }) => {
      expect(twMerge("p-2", "px-4")).toBe("p-2 px-4");
    });

    it("should remove more specific styles", ({ twMerge, expect }) => {
      expect(twMerge("px-4", "p-2")).toBe("p-2");
    });

    it("should propagate unknown classes", ({ twMerge, expect }) => {
      expect(twMerge("px-4 hi p-2 hello", "unknown pb-6 some-other")).toBe(
        "px-4 hi p-2 hello unknown pb-6 some-other"
      );
    });

    it("should work for simple cases", ({ twMerge, expect }) => {
      expect(twMerge("mix-blend-normal", "mix-blend-multiply")).toBe(
        "mix-blend-multiply"
      );
      expect(twMerge("h-10", "h-min")).toBe("h-min");
      expect(twMerge("stroke-black", "stroke-1")).toBe("stroke-black stroke-1");
      expect(twMerge("stroke-2", "stroke-[3]")).toBe("stroke-[3]");
      expect(twMerge("outline-black", "outline-1")).toBe(
        "outline-black outline-1"
      );
      expect(twMerge("grayscale-0", "grayscale-[50%]")).toBe("grayscale-[50%]");
      expect(twMerge("grow", "grow-[2]")).toBe("grow-[2]");
    });
  });
};
