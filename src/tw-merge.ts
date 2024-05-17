import { logWhen } from "./utils/log-when";
import { mapValues } from "./utils/map-values";

export type CompressedConfig = Record<ClassName, CompressedStyles>;
/** [...([PropertyKeys, Value, Order, Important?][])] */
export type CompressedStyles = (PropertyKeys | Value | Order | Important)[];

type CompressedPropMetadata = [PropertyKeys, Value, Order, Important?];

export type PropMetadata = { v: Value; o: Order; i?: Important };

type UncompressedConfig = Record<ClassName, Styles>;
type Styles = Record<PropertyKey, PropMetadata>;
type ClassName = string;
type PropertyKey = string;
/** Property keys split by special char */
type PropertyKeys = string;
type Order = number;
type Value = number;
type Important = 1;

type Falsy = null | undefined | 0 | "" | false;

export type TwMergeFn = ReturnType<typeof createTwMerge>;

export const SPECIAL_SPLIT_CHART = ",";

export const createTwMerge = (compressedConfig: CompressedConfig) => {
  if (!compressedConfig) throw "No config";

  const config: UncompressedConfig = mapValues(compressedConfig, (data) => {
    const obj: Styles = {};
    // split into 4s
    const groups = [] as CompressedPropMetadata[];
    data.forEach((curr, i) => {
      const index = i % 4;
      // @ts-ignore
      if (index === 0) groups.push([]);
      groups.at(-1)!.push(curr);
    });
    // populate config
    groups.forEach(([props, value, order, important]) => {
      props.split(SPECIAL_SPLIT_CHART).forEach((p) => {
        obj[p] = { v: value, o: order, ...(important && { i: 1 }) };
      });
    });

    return obj;
  });

  return (...allClasses: (string | Falsy)[]) => {
    const log = logWhen(false);
    const currentStyles: Styles = {};
    /**
     TODO: performance
     test using split & join VS regex replaceAll for conflicting classes
     Ex. (?:^| +)(?:hello|how) *
     string.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
     @link https://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
     */
    return allClasses
      .reverse()
      .filter(isTruthy)
      .map((classNames, i, arr) => {
        // return first one unchanged to improve perf and do less work when merging is not required
        // let TW linter handle duplicates and classes that update the same thing
        // return classNames
        if (i === 0) return classNames;

        // populate current styles only when needed
        if (i === 1) {
          getClasses(arr[0]).forEach((c) =>
            Object.assign(currentStyles, config[c])
          );
        }

        const classes = getClasses(classNames);
        const nonConflictingClasses = classes.reverse().filter((c) => {
          const styles = config[c];
          // propagate unknown styles, assume custom css classes or css modules
          if (!styles) return true;
          const entries = Object.entries(styles);
          // adds some styles without overriding existing
          let addsStyle = false;
          let addsImportant: boolean | Important | undefined = false;
          const noOverride = entries.every(([prop, map]) => {
            const noExistingStyle = currentStyles[prop] === undefined;
            addsStyle = addsStyle || noExistingStyle;
            addsImportant = !currentStyles[prop]?.i && map.i;
            return (
              noExistingStyle ||
              currentStyles[prop].v === map.v ||
              currentStyles[prop].o > map.o
            );
          });
          const shouldAdd = (addsStyle && noOverride) || addsImportant;
          log({
            shouldAdd,
            addsStyle,
            noOverride,
            class: c,
            allClasses,
            currentStyles: { ...currentStyles },
            styles,
          });
          return shouldAdd;
        });

        // TODO: add all styles as a batch instead of one by one ? treat each passed string as a checked one?
        // No performance benefit, but might influence the styles output
        // Ex. px-4 p-2 + pb-6 --> px-4 p-2 pb-6 OR p-2 pb-6 --> 1st result might be more expected (as batch)
        nonConflictingClasses.forEach((c) =>
          Object.assign(currentStyles, config[c])
        );

        return nonConflictingClasses.reverse().join(" ");
      })
      .reverse()
      .filter(isTruthy)
      .join(" ");
  };
};

const getClasses = (classNames: string) =>
  classNames
    .split(" ")
    .map((x) => x.trim())
    .filter(Boolean);

const isTruthy = <T>(value: T): value is Exclude<T, Falsy> => !!value;
