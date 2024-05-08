import { TwMergeTest } from "./test-context";

export const testConflicts: TwMergeTest = (it) => {
  it("merges non-conflicting classes correctly", ({ twMerge, expect }) => {
    expect(twMerge("border-t", "border-white/10")).toBe(
      "border-t border-white/10"
    );
    expect(twMerge("border-t", "border-white")).toBe("border-t border-white");
    expect(twMerge("text-3.5xl", "text-black")).toBe("text-3.5xl text-black");
  });

  it("handles negative value conflicts correctly", ({ twMerge, expect }) => {
    expect(twMerge("-m-2", "-m-5")).toBe("-m-5");
    expect(twMerge("-top-12", "-top-[50px]")).toBe("-top-[50px]");
  });

  it("handles conflicts between positive and negative values correctly", ({
    twMerge,
    expect,
  }) => {
    expect(twMerge("-m-2", "m-auto")).toBe("m-auto");
    expect(twMerge("-top-[69px]", "top-12")).toBe("top-12");
  });

  it("handles conflicts across groups with negative values correctly", ({
    twMerge,
    expect,
  }) => {
    expect(twMerge("-right-1", "inset-x-1")).toBe("inset-x-1");
    expect(twMerge("hover:focus:-right-1", "hover:focus:inset-x-1")).toBe(
      "hover:focus:inset-x-1"
    );
  });

  it("merges content utilities correctly", ({ twMerge, expect }) => {
    expect(twMerge("content-['hello']", "content-[attr(data-content)]")).toBe(
      "content-[attr(data-content)]"
    );
  });

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

  it("conflicts across postfix modifiers", ({ twMerge, expect }) => {
    expect(twMerge("text-lg/7", "text-lg/8")).toBe("text-lg/8");
    expect(twMerge("text-lg/none", "leading-9")).toBe("text-lg/none leading-9");
    expect(twMerge("leading-9", "text-lg/none")).toBe("text-lg/none");
    expect(twMerge("w-full", "w-1/2")).toBe("w-1/2");
  });

  it("handles color conflicts properly, including the ones extending theme", ({
    twMerge,
    expect,
  }) => {
    expect(twMerge("bg-gray-50", "bg-custom-pink")).toBe("bg-custom-pink");
    expect(twMerge("hover:bg-gray-50", "hover:bg-custom-pink")).toBe(
      "hover:bg-custom-pink"
    );
    expect(twMerge("stroke-[hsl(350_80%_0%)]", "stroke-[10px]")).toBe(
      "stroke-[hsl(350_80%_0%)] stroke-[10px]"
    );
  });
};
