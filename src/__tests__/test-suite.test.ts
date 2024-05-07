import fs from "fs/promises";
import { describe, it } from "vitest";
import { Config } from "../tw-merge";
import { writeToFile } from "../write-to-file";
import { testTwMerge } from "./tw-merge";
import { testPlugin } from "./tw-merge-postcss-plugin";

describe.sequential("tw-merge tooling", () => {
  testPlugin(writeConfig);
  testTwMerge(getConfig);
  it("should cleanup", cleanup);
});

const GENERATED_DIR = "__generated";
const FILE_NAME = "tw-config-example.ts";

const writeConfig = (data: Config) =>
  writeToFile(`${__dirname}/${GENERATED_DIR}/${FILE_NAME}`)(
    `export default ${JSON.stringify(data)}`
  );

const getConfig = async (): Promise<Config> =>
  import(`./${GENERATED_DIR}/${FILE_NAME}`).then((r) => r.default);

const cleanup = () =>
  fs.rm(`${__dirname}/${GENERATED_DIR}`, { recursive: true });
