import { expect } from "vitest";
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
  it("supports custom plugins", ({ twMerge }) => {
    expect(twMerge("all-unset", "all-inherit")).toBe("all-inherit");
    expect(twMerge("all-inherit", "all-unset")).toBe("all-unset");
  });
};
