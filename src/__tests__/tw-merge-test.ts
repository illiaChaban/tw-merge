import { describe, it, expect } from "vitest";
import { Config, createTwMerge } from "../tw-merge";

export const testTwMerge = (getConfig: () => Promise<Config>) =>
  describe("tw-merge", () => {
    let twMerge: ReturnType<typeof createTwMerge>;

    it("should create tw-merge", async () => {
      const config = await getConfig();
      expect(Object.keys(config).includes("p-2")).toBe(true);
      twMerge = createTwMerge(config);
      expect(twMerge).toBeTypeOf("function");
    });

    it("should leave 1 string unchanged", () => {
      expect(twMerge("p-2 px-4")).toBe("p-2 px-4");
      expect(twMerge("px-4 p-2")).toBe("px-4 p-2");
    });

    it("should not remove less specific styles", () => {
      expect(twMerge("p-2", "px-4")).toBe("p-2 px-4");
    });

    it("should remove more specific styles", () => {
      expect(twMerge("px-4", "p-2")).toBe("p-2");
    });

    it("should propagate unknown classes", () => {
      expect(twMerge("px-4 hi p-2 hello", "unknown pb-6 some-other")).toBe(
        "px-4 hi p-2 hello unknown pb-6 some-other"
      );
    });

    it(`
      should treat each passed in string as already checked for conflicts (by linter)
      and avoid comparing classes from 1 string to each other
    `, () => {
      // px-4 p-2 + pb-6 --> px-4 p-2 pb-6, NOT( p-2 pb-6 )
      // Rusulting padding styles: 2 4 6 4, NOT( 2 2 6 2 )
      expect(twMerge("px-4 p-2", "pb-6")).toBe("px-4 p-2 pb-6");
    });

    it("should for simple cases work", () => {
      expect(twMerge("mix-blend-normal", "mix-blend-multiply")).toBe(
        "mix-blend-multiply"
      );
      expect(twMerge("h-10", "h-min")).toBe("h-min");
      expect(twMerge("stroke-black", "stroke-1")).toBe("stroke-black stroke-1");
      expect(twMerge("stroke-2", "stroke-[3]")).toBe("stroke-[3]");
      expect(twMerge("outline-black", "outline-1")).toBe(
        "outline-black outline-1"
      );
      expect(twMerge("grayscale-0", "grayscale-[50%]")).toBe("grayscale-[50%]");
      expect(twMerge("grow", "grow-[2]")).toBe("grow-[2]");
    });

    it("should support falsy values", () => {
      expect(twMerge("grow", null, false, "grow-[2]")).toBe("grow-[2]");
      expect(twMerge("grow-[2]", null, false, "grow")).toBe("grow");
    });

    it("should double down as twJoin from tailwind-merge package", () => {
      expect(twMerge("")).toBe("");
      expect(twMerge("foo")).toBe("foo");
      expect(twMerge(true && "foo")).toBe("foo");
      expect(twMerge(null && "foo")).toBe("");
      expect(twMerge("")).toBe("");
      expect(twMerge("foo", "bar")).toBe("foo bar");
      expect(twMerge(true && "foo", 0 && "bar", "baz")).toBe("foo baz");
      expect(twMerge(false && "foo", "bar", "baz", "")).toBe("bar baz");
    });

    it("merges standalone classes from same group correctly", () => {
      expect(twMerge("inline", "block")).toBe("block");
      expect(twMerge("hover:block", "hover:inline")).toBe("hover:inline");
      expect(twMerge("hover:block", "hover:block")).toBe("hover:block");
      expect(
        twMerge(
          "inline",
          "hover:inline",
          "focus:inline",
          "hover:block",
          "hover:focus:block"
        )
      ).toBe("inline focus:inline hover:block hover:focus:block");
      expect(twMerge("underline", "line-through")).toBe("line-through");
      expect(twMerge("line-through", "no-underline")).toBe("no-underline");
    });

    it("merges non-conflicting classes correctly", () => {
      expect(twMerge("border-t", "border-white/10")).toBe(
        "border-t border-white/10"
      );
      expect(twMerge("border-t", "border-white")).toBe("border-t border-white");
      expect(twMerge("text-3.5xl", "text-black")).toBe("text-3.5xl text-black");
    });

    it("handles negative value conflicts correctly", () => {
      expect(twMerge("-m-2", "-m-5")).toBe("-m-5");
      expect(twMerge("-top-12", "-top-[50px]")).toBe("-top-[50px]");
    });

    it("handles conflicts between positive and negative values correctly", () => {
      expect(twMerge("-m-2", "m-auto")).toBe("m-auto");
      expect(twMerge("-top-[69px]", "top-12")).toBe("top-12");
    });

    it("handles conflicts across groups with negative values correctly", () => {
      expect(twMerge("-right-1", "inset-x-1")).toBe("inset-x-1");
      expect(twMerge("hover:focus:-right-1", "hover:focus:inset-x-1")).toBe(
        "hover:focus:inset-x-1"
      );
    });

    it("merges tailwind classes with important modifier correctly", () => {
      expect(twMerge("!font-medium", "!font-bold")).toBe("!font-bold");
      // TODO: should it keep the last !important class?
      // expect(twMerge("!font-medium", "!font-bold", "font-thin")).toBe(
      //   "!font-bold font-thin"
      // );
      expect(twMerge("!right-2", "!-inset-x-px")).toBe("!-inset-x-px");
      expect(twMerge("focus:!inline", "focus:!block")).toBe("focus:!block");
    });

    it("merges content utilities correctly", () => {
      expect(twMerge("content-['hello']", "content-[attr(data-content)]")).toBe(
        "content-[attr(data-content)]"
      );
    });

    it("handles conflicts across class groups correctly", () => {
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

    it("ring and shadow classes do not create conflict", () => {
      expect(twMerge("ring", "shadow")).toBe("ring shadow");
      expect(twMerge("ring-2", "shadow-md")).toBe("ring-2 shadow-md");
      expect(twMerge("shadow", "ring")).toBe("shadow ring");
      expect(twMerge("shadow-md", "ring-2")).toBe("shadow-md ring-2");
    });

    it("touch classes do create conflicts correctly", () => {
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

    it("line-clamp classes do create conflicts correctly", () => {
      expect(twMerge("overflow-auto", "inline", "line-clamp-1")).toBe(
        "line-clamp-1"
      );
      expect(twMerge("line-clamp-1", "overflow-auto", "inline")).toBe(
        "line-clamp-1 overflow-auto inline"
      );
    });

    // TODO

    // it("handles different order of modifiers correctly", () => {
    //   expect(twMerge("hover:focus:-right-1", "focus:hover:inset-x-1")).toBe(
    //     "focus:hover:inset-x-1"
    //   );
    // })
    //   test('handles pseudo variants conflicts properly', () => {
    //     expect(twMerge('empty:p-2 empty:p-3')).toBe('empty:p-3')
    //     expect(twMerge('hover:empty:p-2 hover:empty:p-3')).toBe('hover:empty:p-3')
    //     expect(twMerge('read-only:p-2 read-only:p-3')).toBe('read-only:p-3')
    // })

    // test('handles pseudo variant group conflicts properly', () => {
    //     expect(twMerge('group-empty:p-2 group-empty:p-3')).toBe('group-empty:p-3')
    //     expect(twMerge('peer-empty:p-2 peer-empty:p-3')).toBe('peer-empty:p-3')
    //     expect(twMerge('group-empty:p-2 peer-empty:p-3')).toBe('group-empty:p-2 peer-empty:p-3')
    //     expect(twMerge('hover:group-empty:p-2 hover:group-empty:p-3')).toBe('hover:group-empty:p-3')
    //     expect(twMerge('group-read-only:p-2 group-read-only:p-3')).toBe('group-read-only:p-3')
    // })

    //   test('conflicts across prefix modifiers', () => {
    //     expect(twMerge('hover:block hover:inline')).toBe('hover:inline')
    //     expect(twMerge('hover:block hover:focus:inline')).toBe('hover:block hover:focus:inline')
    //     expect(twMerge('hover:block hover:focus:inline focus:hover:inline')).toBe(
    //         'hover:block focus:hover:inline',
    //     )
    //     expect(twMerge('focus-within:inline focus-within:block')).toBe('focus-within:block')
    // })

    // test('conflicts across postfix modifiers', () => {
    //     expect(twMerge('text-lg/7 text-lg/8')).toBe('text-lg/8')
    //     expect(twMerge('text-lg/none leading-9')).toBe('text-lg/none leading-9')
    //     expect(twMerge('leading-9 text-lg/none')).toBe('text-lg/none')
    //     expect(twMerge('w-full w-1/2')).toBe('w-1/2')

    //     const customTwMerge = createTailwindMerge(() => ({
    //         cacheSize: 10,
    //         separator: ':',
    //         theme: {},
    //         classGroups: {
    //             foo: ['foo-1/2', 'foo-2/3'],
    //             bar: ['bar-1', 'bar-2'],
    //             baz: ['baz-1', 'baz-2'],
    //         },
    //         conflictingClassGroups: {},
    //         conflictingClassGroupModifiers: {
    //             baz: ['bar'],
    //         },
    //     }))

    //     expect(customTwMerge('foo-1/2 foo-2/3')).toBe('foo-2/3')
    //     expect(customTwMerge('bar-1 bar-2')).toBe('bar-2')
    //     expect(customTwMerge('bar-1 baz-1')).toBe('bar-1 baz-1')
    //     expect(customTwMerge('bar-1/2 bar-2')).toBe('bar-2')
    //     expect(customTwMerge('bar-2 bar-1/2')).toBe('bar-1/2')
    //     expect(customTwMerge('bar-1 baz-1/2')).toBe('baz-1/2')
    // })
  });
