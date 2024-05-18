import { describe, expect } from "vitest";
import { TwMergeTest } from "./test-context";

export const testArbitraryProperties: TwMergeTest = (it) => {
  describe("arbitrary properties", () => {
    it("handles simple cases", ({ twMerge }) => {
      expect(twMerge("[paint-order:markers]", "[paint-order:normal]")).toBe(
        "[paint-order:normal]"
      );
      expect(
        twMerge(
          "[paint-order:markers]",
          "[--my-var:2rem]",
          "[paint-order:normal]",
          "[--my-var:4px]"
        )
      ).toBe("[paint-order:normal] [--my-var:4px]");
    });

    it("handles modifiers correctly", ({ twMerge }) => {
      expect(
        twMerge("[paint-order:markers]", "hover:[paint-order:normal]")
      ).toBe("[paint-order:markers] hover:[paint-order:normal]");
      expect(
        twMerge("hover:[paint-order:markers]", "hover:[paint-order:normal]")
      ).toBe("hover:[paint-order:normal]");
      expect(
        twMerge(
          "hover:focus:[paint-order:markers]",
          "focus:hover:[paint-order:normal]"
        )
      ).toBe("focus:hover:[paint-order:normal]");
      expect(
        twMerge(
          "[paint-order:markers]",
          "[paint-order:normal]",
          "[--my-var:2rem]",
          "lg:[--my-var:4px]"
        )
      ).toBe("[paint-order:normal] [--my-var:2rem] lg:[--my-var:4px]");
    });

    it("handles complex arbitrary property conflicts correctly", ({
      twMerge,
    }) => {
      expect(twMerge("[src:local(serif)]", "[src:url(https://hi.com)]")).toBe(
        "[src:url(https://hi.com)]"
      );
      expect(twMerge("[src:url(https://hi.com)]", "[src:local(serif)]")).toBe(
        "[src:local(serif)]"
      );
    });
  });
};
