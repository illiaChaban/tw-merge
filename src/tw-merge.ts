export type Config = Record<ClassName, Styles>;
export type Styles = Record<PropertyKey, Order>;
type ClassName = string;
type PropertyKey = string;
type Order = number;

export const createTwMerge = (config: Config) => {
  if (!config) throw "No config";

  return (...allClasses: string[]) => {
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
      .map((classNames, i, arr) => {
        //return first one unchanged to improve perf and do less work when merging is not required
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
          const hasConflict =
            styles &&
            Object.entries(styles).some(
              ([prop, order]) =>
                currentStyles[prop] && order > currentStyles[prop]
            );

          return !hasConflict;
        });

        // TODO: add all styles as a batch instead of one by one ? treat each passed string as a checked one?
        // No performance benefit, but might influence the styles output
        // Ex. px-4 p-2 + pb-6 --> px-4 p-2 pb-6 OR p-2 pb-6 --> 1st result might be more expected (as batch)
        nonConflictingClasses.forEach((c) =>
          Object.assign(currentStyles, config[c])
        );

        return nonConflictingClasses.reverse().join(" ");

        // return classes.reduce((curr, c) => {
        //   const styles = config[c]
        //   const hasConflict = Object.entries(styles).some()
        //   if (hasConflict) return curr
        // }, '')
      })
      .reverse()
      .filter(Boolean)
      .join(" ");
  };
};

const getClasses = (classNames: string) =>
  classNames
    .split(" ")
    .map((x) => x.trim())
    .filter(Boolean);
