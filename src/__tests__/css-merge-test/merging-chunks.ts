import { TwMergeTest } from "./test-context";

export const testMergeChunks: TwMergeTest = (it) => {
  it("should leave 1 string unchanged", ({ twMerge, expect }) => {
    expect(twMerge("p-2 px-4")).toBe("p-2 px-4");
    expect(twMerge("px-4 p-2")).toBe("px-4 p-2");
  });

  it(
    "should treat each passed in string as already checked for conflicts (by linter) " +
      "and avoid comparing classes from 1 string to each other",
    ({ twMerge, expect }) => {
      // px-4 p-2 + pb-6 --> px-4 p-2 pb-6, NOT( p-2 pb-6 )
      // Rusulting padding styles: 2 4 6 4, NOT( 2 2 6 2 )
      expect(twMerge("px-4 p-2", "pb-6")).toBe("px-4 p-2 pb-6");
    }
  );
};
