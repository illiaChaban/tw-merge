import { TwMergeTest } from "./test-context";

export const testPseudoClasses: TwMergeTest = (it) => {
  it("handles pseudo variants conflicts properly", ({ twMerge, expect }) => {
    expect(twMerge("empty:p-2", "empty:p-3")).toBe("empty:p-3");
    expect(twMerge("empty:p-3", "empty:p-2")).toBe("empty:p-2");
    expect(twMerge("hover:empty:p-2", "hover:empty:p-3")).toBe(
      "hover:empty:p-3"
    );
    expect(twMerge("read-only:p-2", "read-only:p-3")).toBe("read-only:p-3");
  });
};
