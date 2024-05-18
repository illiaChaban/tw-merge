import { TestAPI } from "vitest";
import { CssMergeFn } from "../../css-merge";

export type TwMergeTest = (it: TestAPI<{ twMerge: CssMergeFn }>) => void;
