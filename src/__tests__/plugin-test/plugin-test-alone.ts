import postcss from "postcss";
import { describe, expect, it } from "vitest";
import { postcssPlugin } from "../../postcss-plugin";
import { CompressedConfig } from "../../css-merge.js";
import { isEmpty } from "../../utils/is";

export const testPluginAlone = ({
  getInputCss,
  onParsedConfig,
}: {
  getInputCss: () => Promise<string>;
  onParsedConfig: (data: CompressedConfig) => Promise<void>;
}) =>
  describe(postcssPlugin.name, () => {
    it("should generate config based on raw css", async () => {
      const inputCss = await getInputCss();

      console.log(inputCss);

      let compressedConfig: CompressedConfig;

      const processed = await postcss([
        postcssPlugin({
          onParsed: (data) => (compressedConfig = data),
        }),
      ]).process(inputCss, { from: undefined });

      const config = compressedConfig!;

      expect(isEmpty(config)).toBe(false);
      // no changes to input css
      expect(inputCss).toEqual(processed.css);

      await onParsedConfig(config);
    });
  });
