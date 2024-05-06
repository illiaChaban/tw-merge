import postcss from "postcss";
import { describe, it, expect } from "vitest";
import fs from "fs/promises";
// @ts-expect-error
import twMergePlugin from "../tw-merge-postcss-plugin.js";
import tailwindcss from "tailwindcss";
// @ts-expect-error
import tailwindConfig from "../../test-project/tailwind.config.js";
import cssnano from "cssnano";
import { Config } from "../tw-merge.js";

export const testPlugin = () =>
  describe(twMergePlugin.name, () => {
    it("should generate config", async () => {
      const inputCssPath = __dirname + "/../../test-project/src/input.css";
      const inputCss = await fs.readFile(inputCssPath, "utf-8");

      let twConfig: Config;

      const processed = await postcss([
        tailwindcss({
          ...tailwindConfig,
          content: [__dirname + "/../../test-project/src/index.html"],
        }),
        twMergePlugin({
          onParsed: (data: any) => {
            twConfig = data;
          },
        }),
      ]).process(inputCss, {
        from: inputCssPath,
      });

      // console.log(
      //   `

      // processed

      // `,
      //   processed.css
      // );

      const isEmpty = (obj: {}) =>
        typeof obj === "object" && Object.keys(obj).length === 0;

      // @ts-ignore
      expect(isEmpty(twConfig)).toBe(false);

      await fs.writeFile(
        __dirname + "/tw-config-example.ts",
        // @ts-ignore
        `export default ${JSON.stringify(twConfig)}`
      );

      // const minified = (await postcss([cssnano]).process(processed.css)).css;

      // console.log(
      //   `

      // minfied

      // `,
      //   minified
      // );
      // const minifiedOutputCss = await fs.readFile(
      //   __dirname + "/../../test-project/src/output-minified.css",
      //   "utf-8"
      // );

      // expect(minified).toEqual(minifiedOutputCss);
    });
  });
