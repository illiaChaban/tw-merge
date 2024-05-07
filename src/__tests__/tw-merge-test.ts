import { describe, it, expect } from "vitest";
import { Config, createTwMerge } from "../tw-merge";

export const testTwMerge = (getConfig: () => Promise<Config>) =>
  describe("tw-merge", () => {
    let twMerge: ReturnType<typeof createTwMerge>;

    it("should create tw-merge", async () => {
      const config = await getConfig();
      expect(Object.keys(config).includes("p-2")).toBe(true);
      twMerge = createTwMerge(config);
      expect(twMerge).toBeTypeOf("function");
    });

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

    it("should for simple cases work", () => {
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

    it("should support falsy values", () => {
      expect(twMerge("grow", null, false, "grow-[2]")).toBe("grow-[2]");
      expect(twMerge("grow-[2]", null, false, "grow")).toBe("grow");
    });

    it("should double down as twJoin from tailwind-merge package", () => {
      expect(twMerge("")).toBe("");
      expect(twMerge("foo")).toBe("foo");
      expect(twMerge(true && "foo")).toBe("foo");
      expect(twMerge(null && "foo")).toBe("");
      expect(twMerge("")).toBe("");
      expect(twMerge("foo", "bar")).toBe("foo bar");
      expect(twMerge(true && "foo", 0 && "bar", "baz")).toBe("foo baz");
      expect(twMerge(false && "foo", "bar", "baz", "")).toBe("bar baz");
    });

    it("merges standalone classes from same group correctly", () => {
      expect(twMerge("inline", "block")).toBe("block");
      expect(twMerge("hover:block", "hover:inline")).toBe("hover:inline");
      expect(twMerge("hover:block", "hover:block")).toBe("hover:block");
      expect(
        twMerge(
          "inline",
          "hover:inline",
          "focus:inline",
          "hover:block",
          "hover:focus:block"
        )
      ).toBe("inline focus:inline hover:block hover:focus:block");
      expect(twMerge("underline", "line-through")).toBe("line-through");
      expect(twMerge("line-through", "no-underline")).toBe("no-underline");
    });
  });
