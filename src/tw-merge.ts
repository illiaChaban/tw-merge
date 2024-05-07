export type Config = Record<ClassName, Styles>;
export type Styles = Record<PropertyKey, Order>;
type ClassName = string;
type PropertyKey = string;
type Order = number;
type Falsy = null | undefined | 0 | "" | false;

export const createTwMerge = (config: Config) => {
  if (!config) throw "No config";

  // console.log({ ...config });

  return (...allClasses: (string | Falsy)[]) => {
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
        //return first one unchanged to improve perf and do less work when merging is not required
        // let TW linter handle duplicates and classes that update the same thing
        // return classNames
        if (i === 0) return classNames;

        // populate current styles only when needed
        if (i === 1) {
          // console.log("populate now", {
          //   i,
          //   config,
          //   classes: getClasses(arr[0]),
          // });
          // getClasses(arr[0]).forEach((c) =>
          //   console.log("populate now", { c, i, values: config[c], config })
          // );
          getClasses(arr[0]).forEach((c) =>
            Object.assign(currentStyles, config[c])
          );
        }
        console.log("here!");

        const classes = getClasses(classNames);
        const nonConflictingClasses = classes.reverse().filter((c) => {
          const styles = config[c];
          console.log({ c, styles, config });
          // propagate unknown styles, assume custom css classes or css modules
          if (!styles) return true;
          const entries = Object.entries(styles);
          // adds some styles without overriding existing
          let addsStyle = false;
          const noOverride = entries.every(([prop, order]) => {
            const noExistingStyle = currentStyles[prop] === undefined;
            addsStyle = addsStyle || noExistingStyle;
            return noExistingStyle || currentStyles[prop] > order;
          });
          const shouldAdd = addsStyle && noOverride;
          console.log({
            shouldAdd,
            class: c,
            allClasses,
            currentStyles: { ...currentStyles },
            styles,
          });
          return shouldAdd;
          // const shouldAdd =
          // const hasConflict =
          //   styles &&
          //   Object.entries(styles).some(
          //     ([prop, order]) =>
          //       currentStyles[prop] && order > currentStyles[prop]
          //   );

          // return !hasConflict;
        });

        // TODO: add all styles as a batch instead of one by one ? treat each passed string as a checked one?
        // No performance benefit, but might influence the styles output
        // Ex. px-4 p-2 + pb-6 --> px-4 p-2 pb-6 OR p-2 pb-6 --> 1st result might be more expected (as batch)
        nonConflictingClasses.forEach((c) =>
          Object.assign(currentStyles, config[c])
        );

        // console.log({
        //   currentStyles: { ...currentStyles },
        //   nonConflictingClasses,
        // });

        return nonConflictingClasses.reverse().join(" ");

        // return classes.reduce((curr, c) => {
        //   const styles = config[c]
        //   const hasConflict = Object.entries(styles).some()
        //   if (hasConflict) return curr
        // }, '')
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
