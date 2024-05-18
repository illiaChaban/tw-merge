import postcss from "postcss";
import tailwindcss from "tailwindcss";
import { describe, expect, it } from "vitest";
import { postcssPlugin } from "../../postcss-plugin";
import { CompressedConfig } from "../../css-merge.js";
import { customTwPlugin } from "../css-merge-test/custom-plugins";
import { isEmpty } from "../../utils/is";

export const testPluginWithTailwind = ({
  onProcessedCss,
  onParsedConfig,
}: {
  onProcessedCss?: (css: string) => Promise<void>;
  onParsedConfig: (data: CompressedConfig) => Promise<void>;
}) =>
  describe(postcssPlugin.name, () => {
    it("should generate config based on tailwind css with tailwind plugin", async () => {
      const inputCss = `
        @tailwind base;
        @tailwind components;
        @tailwind utilities;
      `;

      let twConfig: CompressedConfig;

      const processed = await postcss([
        tailwindcss({
          content: [__dirname + "/../css-merge-test/**/*.ts"],
          theme: {
            extend: {
              colors: {
                "custom-pink": "#f472b6",
              },
            },
          },
          plugins: [customTwPlugin],
        }),
        postcssPlugin({
          onParsed: (data) => (twConfig = data),
        }),
      ]).process(inputCss, { from: undefined });

      // console.log(processed.css);

      await onProcessedCss?.(processed.css);

      const config = twConfig!;

      expect(isEmpty(config)).toBe(false);

      // console.log(JSON.stringify(config));

      await onParsedConfig(config);
    });
  });
