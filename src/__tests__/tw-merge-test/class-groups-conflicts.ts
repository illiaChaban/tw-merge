import { TwMergeTest } from "./test-context";

export const testClassGroupsConflicts: TwMergeTest = (it) => {
  it("handles conflicts across class groups correctly", ({
    twMerge,
    expect,
  }) => {
    expect(twMerge("inset-1", "inset-x-1")).toBe("inset-1 inset-x-1");
    expect(twMerge("inset-x-1", "inset-1")).toBe("inset-1");
    expect(twMerge("inset-x-1", "left-1", "inset-1")).toBe("inset-1");
    expect(twMerge("inset-x-1", "inset-1", "left-1")).toBe("inset-1 left-1");
    expect(twMerge("inset-x-1", "right-1", "inset-1")).toBe("inset-1");
    expect(twMerge("inset-x-1", "right-1", "inset-x-1")).toBe("inset-x-1");
    expect(twMerge("inset-x-1", "right-1", "inset-y-1")).toBe(
      "inset-x-1 right-1 inset-y-1"
    );
    expect(twMerge("right-1", "inset-x-1", "inset-y-1")).toBe(
      "inset-x-1 inset-y-1"
    );
    expect(twMerge("inset-x-1", "hover:left-1", "inset-1")).toBe(
      "hover:left-1 inset-1"
    );
  });

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
