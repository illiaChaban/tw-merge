import postcss from "postcss";
import tailwindcss from "tailwindcss";
import { describe, expect, it } from "vitest";
import twMergePlugin from "../tw-merge-postcss-plugin";
import { CompressedConfig } from "../tw-merge.js";
import { customTwPlugin } from "./tw-merge-test/custom-plugins";

export const testPlugin = (
  writeConfig: (data: CompressedConfig) => Promise<void>
) =>
  describe(twMergePlugin.name, () => {
    it("should generate config", async () => {
      const inputCss = `
        @tailwind base;
        @tailwind components;
        @tailwind utilities;
      `;

      let twConfig: CompressedConfig;

      const processed = await postcss([
        tailwindcss({
          content: [__dirname + "/tw-merge-test/**/*.ts"],
          theme: {
            extend: {
              colors: {
                "custom-pink": "#f472b6",
              },
            },
          },
          plugins: [customTwPlugin],
        }),
        twMergePlugin({
          onParsed: (data: any) => {
            twConfig = data;
          },
        }),
      ]).process(inputCss, { from: undefined });

      // console.log(processed.css);

      const config = twConfig!;

      expect(isEmpty(config)).toBe(false);

      console.log(JSON.stringify(config));

      await writeConfig(config);
    });
  });

const isEmpty = (obj: {}) =>
  typeof obj === "object" && Object.keys(obj).length === 0;
