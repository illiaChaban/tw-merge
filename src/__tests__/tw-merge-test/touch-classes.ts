import { TwMergeTest } from "./test-context";

export const testTouchClasses: TwMergeTest = (it) => {
  it("touch classes do create conflicts correctly", ({ twMerge, expect }) => {
    expect(twMerge("touch-pan-x", "touch-pan-right")).toBe("touch-pan-right");
    expect(twMerge("touch-none", "touch-pan-x")).toBe("touch-pan-x");
    expect(twMerge("touch-pan-x", "touch-none")).toBe("touch-none");
    expect(twMerge("touch-pan-x", "touch-pan-y", "touch-pinch-zoom")).toBe(
      "touch-pan-x touch-pan-y touch-pinch-zoom"
    );
    expect(
      twMerge(
        "touch-manipulation",
        "touch-pan-x",
        "touch-pan-y",
        "touch-pinch-zoom"
      )
    ).toBe("touch-pan-x touch-pan-y touch-pinch-zoom");
    expect(
      twMerge("touch-pan-x", "touch-pan-y", "touch-pinch-zoom", "touch-auto")
    ).toBe("touch-auto");
  });
};
