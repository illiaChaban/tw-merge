import { describe, expect } from "vitest";
import { TwMergeTest } from "./test-context";

export const testFalsyValues: TwMergeTest = (it) => {
  describe("falsy values", () => {
    it("should support falsy values 1", ({ twMerge }) => {
      expect(twMerge("grow", null, false, "grow-[2]")).toBe("grow-[2]");
      expect(twMerge("grow-[2]", null, false, "grow")).toBe("grow");
    });

    it("should support falsy values 2", ({ twMerge }) => {
      expect(twMerge("")).toBe("");
      expect(twMerge("foo")).toBe("foo");
      expect(twMerge(true && "foo")).toBe("foo");
      expect(twMerge(null && "foo")).toBe("");
      expect(twMerge("")).toBe("");
      expect(twMerge("foo", "bar")).toBe("foo bar");
      expect(twMerge(true && "foo", 0 && "bar", "baz")).toBe("foo baz");
      expect(twMerge(false && "foo", "bar", "baz", "")).toBe("bar baz");
    });
  });
};
