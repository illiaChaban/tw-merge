import { TwMergeTest } from "./test-context";

export const testPrefixModifiers: TwMergeTest = (it) => {
  it("conflicts across prefix modifiers", ({ twMerge, expect }) => {
    expect(twMerge("hover:block", "hover:inline")).toBe("hover:inline");
    expect(twMerge("hover:block", "hover:focus:inline")).toBe(
      "hover:block hover:focus:inline"
    );
    expect(
      twMerge("hover:block", "hover:focus:inline", "focus:hover:inline")
    ).toBe("hover:block focus:hover:inline");
    expect(twMerge("focus-within:inline", "focus-within:block")).toBe(
      "focus-within:block"
    );
  });

  it("handles different order of modifiers correctly", ({
    twMerge,
    expect,
  }) => {
    expect(twMerge("hover:focus:-right-1", "focus:hover:inset-x-1")).toBe(
      "focus:hover:inset-x-1"
    );
  });
};
