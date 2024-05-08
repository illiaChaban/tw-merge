import { TestAPI } from "vitest";
import { TwMergeFn } from "../../tw-merge";

export type TwMergeTest = (it: TestAPI<{ twMerge: TwMergeFn }>) => void;
