import { describe, expect } from "vitest";
import { TwMergeTest } from "./test-context";

export const testArbitraryValues: TwMergeTest = (it) => {
  describe("arbitrary values", () => {
    it("handles simple conflicts with arbitrary values correctly", ({
      twMerge,
    }) => {
      expect(twMerge("m-[2px]", "m-[10px]")).toBe("m-[10px]");
      expect(
        twMerge(
          "m-[2px]",
          "m-[11svmin]",
          "m-[12in]",
          "m-[13lvi]",
          "m-[14vb]",
          "m-[15vmax]",
          "m-[16mm]",
          "m-[17%]",
          "m-[18em]",
          "m-[19px]",
          "m-[10dvh]"
        )
      ).toBe("m-[10dvh]");
      expect(
        twMerge(
          "h-[10px]",
          "h-[11cqw]",
          "h-[12cqh]",
          "h-[13cqi]",
          "h-[14cqb]",
          "h-[15cqmin]",
          "h-[16cqmax]"
        )
      ).toBe("h-[16cqmax]");
      expect(twMerge("z-20", "z-[99]")).toBe("z-[99]");
      expect(twMerge("my-[2px]", "m-[10rem]")).toBe("m-[10rem]");
      expect(twMerge("cursor-pointer", "cursor-[grab]")).toBe("cursor-[grab]");
      expect(twMerge("m-[2px]", "m-[calc(100%-var(--arbitrary))]")).toBe(
        "m-[calc(100%-var(--arbitrary))]"
      );
      expect(twMerge("m-[2px]", "m-[length:var(--mystery-var)]")).toBe(
        "m-[length:var(--mystery-var)]"
      );
      expect(twMerge("opacity-10", "opacity-[0.025]")).toBe("opacity-[0.025]");
      expect(twMerge("scale-75", "scale-[1.7]")).toBe("scale-[1.7]");
      expect(twMerge("brightness-90", "brightness-[1.75]")).toBe(
        "brightness-[1.75]"
      );

      // Handling of value `0`
      expect(twMerge("min-h-[0.5px]", "min-h-[0]")).toBe("min-h-[0]");
      expect(twMerge("text-[0.5px]", "text-[color:0]")).toBe(
        "text-[0.5px] text-[color:0]"
      );
      expect(twMerge("text-[0.5px]", "text-[--my-0]")).toBe(
        "text-[0.5px] text-[--my-0]"
      );
    });

    it("handles arbitrary length conflicts with labels and modifiers correctly", ({
      twMerge,
    }) => {
      expect(twMerge("hover:m-[2px]", "hover:m-[length:var(--c)]")).toBe(
        "hover:m-[length:var(--c)]"
      );
      expect(
        twMerge("hover:focus:m-[2px]", "focus:hover:m-[length:var(--c)]")
      ).toBe("focus:hover:m-[length:var(--c)]");
      expect(twMerge("border-b", "border-[#243c5a]")).toBe(
        "border-b border-[#243c5a]"
      );
      expect(twMerge("border-[#243c5a]", "border-b")).toBe(
        "border-[#243c5a] border-b"
      );
      expect(twMerge("border-b", "border-[#243c5a]", "border-slate-800")).toBe(
        "border-b border-slate-800"
      );
    });

    it("handles complex arbitrary value conflicts correctly", ({ twMerge }) => {
      expect(twMerge("grid-rows-[1fr_auto]", "grid-rows-2")).toBe(
        "grid-rows-2"
      );
      expect(twMerge("grid-rows-3", "grid-rows-[1fr_500px_2fr]")).toBe(
        "grid-rows-[1fr_500px_2fr]"
      );
    });

    it("handles ambiguous arbitrary values correctly", ({ twMerge }) => {
      expect(twMerge("mt-2", "mt-[calc(theme(fontSize.4xl)/1.125)]")).toBe(
        "mt-[calc(theme(fontSize.4xl)/1.125)]"
      );
      expect(twMerge("p-2", "p-[calc(theme(fontSize.4xl)/1.125)_10px]")).toBe(
        "p-[calc(theme(fontSize.4xl)/1.125)_10px]"
      );
    });
  });
};
