import { describe, it, expect } from "vitest";
import { createTwMerge } from "../tw-merge";

import configExample from "./tw-config-example";

export const testTwMerge = () =>
  describe("tw-merge", () => {
    const twMerge = createTwMerge(configExample);

    it("should leave 1 string unchanged", () => {
      expect(twMerge("p-2 px-4")).toBe("p-2 px-4");
      expect(twMerge("px-4 p-2")).toBe("px-4 p-2");
    });

    it("should not remove less specific styles", () => {
      expect(twMerge("p-2", "px-4")).toBe("p-2 px-4");
    });

    it("should remove more specific styles", () => {
      expect(twMerge("px-4", "p-2")).toBe("p-2");
    });

    it("should propagate unknown classes", () => {
      expect(twMerge("px-4 hi p-2 hello", "unknown pb-6 some-other")).toBe(
        "px-4 hi p-2 hello unknown pb-6 some-other"
      );
    });

    it(`
      should treat each passed in string as already checked for conflicts (by linter)
      and avoid comparing classes from 1 string to each other
    `, () => {
      // px-4 p-2 + pb-6 --> px-4 p-2 pb-6, NOT( p-2 pb-6 )
      // Rusulting padding styles: 2 4 6 4, NOT( 2 2 6 2 )
      expect(twMerge("px-4 p-2", "pb-6")).toBe("px-4 p-2 pb-6");
    });
  });
