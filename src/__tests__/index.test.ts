import fs from "fs/promises";
import { describe, it } from "vitest";
import { CompressedConfig } from "../css-merge";
import { writeToFile } from "../utils/write-to-file";
import { testTwMerge } from "./css-merge-test";
import { testPluginWithTailwind } from "./plugin-test/plugin-test-with-tailwind";
import { writeConfig } from "../postcss-plugin";

describe.sequential("tw-merge tooling", () => {
  testPluginWithTailwind({
    onParsedConfig: writeGeneratedConfig(CONFIG_FILE_NAME),
    onProcessedCss: writeGenerated(OUTPUT_CSS_FILE_NAME),
  });
  testTwMerge(getConfig);
  it("cleanup generated config", () => removeGenerated(CONFIG_FILE_NAME));

  it("cleanup all", () => removeGenerated());

  // TODO: test dark & size media queries combinations
  // TODO: test custom prefixes https://github.com/dcastil/tailwind-merge/blob/v2.3.0/tests/prefixes.test.ts
  // TODO: test custom separators https://github.com/dcastil/tailwind-merge/blob/v2.3.0/tests/separators.test.ts
});

const GENERATED_DIR = "__generated";
const CONFIG_FILE_NAME = "config-example.ts";
const OUTPUT_CSS_FILE_NAME = "output.css";

const getGeneratedPath = (fileName?: string) =>
  `${__dirname}/${GENERATED_DIR}${fileName ? "/" + fileName : ""}`;

const writeGenerated = (fileName: string) => (data: string) =>
  writeToFile(getGeneratedPath(fileName))(data);

const removeGenerated = (fileName?: string) =>
  fs.rm(getGeneratedPath(fileName), {
    recursive: true,
  });

const writeGeneratedConfig = (fileName: string) =>
  writeConfig(getGeneratedPath(fileName));

const getConfig = async (): Promise<CompressedConfig> =>
  import(`./${GENERATED_DIR}/${CONFIG_FILE_NAME}`).then((r) => r.default);
