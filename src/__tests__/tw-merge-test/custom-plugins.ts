import { describe, expect } from "vitest";
import { TwMergeTest } from "./test-context";
import { PluginCreator } from "tailwindcss/types/config";

export const customTwPlugin: PluginCreator = ({ addUtilities }) => {
  addUtilities({
    ".no-scrollbar": {
      "scrollbar-width": "none",
      "-ms-overflow-style": "none",
      "&::-webkit-scrollbar": {
        display: "none",
      },
    },
    ".all-unset": {
      all: "unset",
    },
    ".all-inherit": {
      all: "inherit",
    },
  });
};

export const testCustomPlugins: TwMergeTest = (it) => {
  describe("custom plugin classes", () => {
    it("supports custom plugins", ({ twMerge }) => {
      expect(twMerge("all-unset", "all-inherit")).toBe("all-inherit");
      expect(twMerge("all-inherit", "all-unset")).toBe("all-unset");
    });

    it("handles overrides for the same property, but different 'location' (root vs pseudoelement)", ({
      twMerge,
    }) => {
      expect(twMerge("flex", "no-scrollbar")).toBe("flex no-scrollbar");
      expect(twMerge("no-scrollbar", "flex")).toBe("no-scrollbar flex");
    });
  });
};
