import { describe } from "vitest";
import { testPlugin } from "./tw-merge-postcss-plugin";
import { testTwMerge } from "./tw-merge";
import { Config } from "../tw-merge";
import { writeToFile } from "../write-to-file";

describe.sequential("tw-merge tooling", () => {
  testPlugin(writeConfig);
  testTwMerge(getConfig);
});

const PATH_TO_CONFIG = "/__generated/tw-config-example.ts";

const writeConfig = (data: Config) =>
  writeToFile(`${__dirname}${PATH_TO_CONFIG}`)(
    `export default ${JSON.stringify(data)}`
  );

const getConfig = async (): Promise<Config> => {
  const module = (await import(`.${PATH_TO_CONFIG}`)) as any;
  return module.default;
};
