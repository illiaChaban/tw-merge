import { Declaration, PluginCreator } from "postcss";
import { CompressedConfig, CompressedStyles, PropMetadata } from "./tw-merge";
import { logWhen } from "./utils/log-when";

/**

TODO: performance: tw-merge add caching?

Comparing value & priority instead of just priority -->
i.e 
most after classes have "content: var(...)" line, if value is the same for 2 classes it's ok to add them both
i.e x2
p-2, px-3 > p-2 px-3 OR px-3 ?  --> p-2 px-3
px-3, p-2 > p-2 OR px-3 p-2 ?   --> p-2
px-2 px-3 > px-3 OR px-2 px-3 ? -->
px-3 px-2 > px-2

>> if value is different, remove it? but how do i know if class updates other values that might be needed (p-2 pr-3)

Is there any harm in tracking "order" when checking for conflicts? Will it create a weird behavoir that will change the output classNames
based on internal component implementation + passed overrides?

Ex. ...

Goal: to make overrides non-dependent on internal component styling with deterministic results 
(doesn't matter if base component is using `px-2 py-2` or `p-2`)
Ex.
const BaseComponent = tw(div)`...`
const ParentComponent = () => <BaseComponent class="..." />


TODO: handle !important modifier correctly (may not adhere to order rule)
- should it just be a logic inside tw-merge to not touch those? or should the users still be able to override them

TODO: how much perf did i save by minimizing ? compare minimized VS non-minimized config
 */

const cssMergePlugin: PluginCreator<{
  onParsed: (data: CompressedConfig) => void;
}> = (
  { onParsed } = {
    onParsed: () => panic("onParsed is not defined"),
  }
) => {
  console.log(`
  
  
  execute myCustomPlugin
  
  
  `);
  return {
    postcssPlugin: "my-custom-plugin",
    async Once(root, { result }) {
      console.log(
        ` 
      
      
      
      ONCE
      
      
      `
        // root,
        // result
      );

      /**
       * type Parsed = {[className]: {[Key]: AffectedProperties} }
       * type Key = PseudeElementName | ''
       * TODO: do i need priority
       * type AffectedProperties = {[prop]: priority}
       */

      const parsed: DeepConfig = {};

      /** Is keeping track of this even useful? */
      let rulePriority = 0;
      root.walkRules((rule) => {
        const isClass = rule.selector[0] === ".";
        // TODO: remove reliance on tailwind preprocessing
        // @ts-ignore
        const classCandidate = rule.raws?.tailwind?.classCandidate as string;
        if (!isClass || !classCandidate) return;

        rulePriority++;
        const affectedProps = rule.nodes
          // TODO: handle other cases
          .filter((n): n is Declaration => n instanceof Declaration)
          .map((n) => [n.prop, n.value]);

        const classes = rule.selector
          .replaceAll("\\", "")
          .split(", ")
          .map((c) => {
            // get "actionable" class from group-*, peer-* etc.
            // Ex. group:hover .dark .group-hover\:dark\:opacity-100
            c = c.includes(" ") ? c.split(" ").at(-1)! : c;
            // remove "." before class name
            return c.slice(1);
          });

        const LOG = logWhen(false);
        LOG(`
          Processing rule: ${classes.join(" ")}
          affected props: ${JSON.stringify(affectedProps)}
        `);

        classes.forEach((c) => {
          // Tailwind metadata doesn't automatically include "!" important in classCandidate
          const isImportant = c[c.indexOf(classCandidate) - 1] === "!";
          const mainClassName = isImportant
            ? "!" + classCandidate
            : classCandidate;
          const splitter = c.startsWith(mainClassName)
            ? mainClassName
            : ":" + mainClassName;
          const [twModifiers, cssModifiers, ...rest] = c.split(splitter);
          /** Order of modifers generally shouldn't matter */
          const sortedModifers = twModifiers.split(":").sort().join(":");
          /** Classname the way it's displayed in html */
          const htmlClassName = c.slice(
            0,
            sortedModifers.length + splitter.length
          );
          if (rest.length)
            throw new Error(`Rest should be empty: ${JSON.stringify(rest)}`);
          const pseudoElement = cssModifiers
            ?.split?.("::")[1]
            ?.split?.(":")?.[0];

          LOG(`
            ${JSON.stringify({ splitter, mainClassName, isImportant })}
            twModifiers: ${sortedModifers.split(":").join(", ")}
            pseudoElement: ${pseudoElement}
          `);

          const affectedPropsMap = Object.fromEntries(
            affectedProps
              // @ts-ignore
              .flatMap(expandShorthand)
              .map(([p, value]) => [
                p,
                { o: rulePriority, v: value, i: isImportant },
              ])
          );

          parsed[htmlClassName] ??= {};
          /** 
          TODO: rely on css modifiers & parse media queries instead of relying to tw modifers? 
          TODO: or support different orders of tw modifiers when they evaluate to the same thing
          For now assuming that two classes are conflicting only if they modify intersecting properties with the same 
          tw modifers and on the same pseudelement (or root)
          */
          const key = [sortedModifers, pseudoElement ?? "root"]
            .filter(Boolean)
            .join("::");
          parsed[htmlClassName][key] ??= {};
          parsed[htmlClassName][key] = {
            ...parsed[htmlClassName][key],
            ...affectedPropsMap,
          };
        });

        LOG(`
          raws: ${JSON.stringify(rule.raws)}
          classCandidate: ${
            // @ts-ignore
            rule.raws?.tailwind?.classCandidate
          }
          props: 
          ${affectedProps
            .map(([prop, value]) => prop + ": " + value)
            .join(";\n ")}

          ________________________________________________
        `);
      });

      // TODO: should i minimize parsed object, i.e replace all properties with autogenerated values that are shorter
      // to reduce memory usage and comparison efficiency, since it's doesn't matter what it is, as long as it's 1 to 1 mapping

      // console.log(`

      // Parsed:
      // ${JSON.stringify(parsed)}

      // `);

      const minimized = compressConfig(flattenConfig(parsed));
      // const minimized = flattenConfig(parsed);

      // console.log(`

      // Minimized:
      // ${JSON.stringify(minimized)}

      // `);

      await onParsed(minimized);

      console.log("Saved!");
    },
  };
};
cssMergePlugin.postcss = true;

export default cssMergePlugin;

const expandShorthand = ([property, value]: [string, string]) => {
  // TODO: extend this
  const shorthands = {
    padding: ["padding-top", "padding-right", "padding-bottom", "padding-left"],
    margin: ["margin-top", "margin-right", "margin-bottom", "margin-left"],
    inset: ["top", "right", "bottom", "left"],
  };
  return (
    // @ts-ignore
    shorthands[property]?.map((prop) => [prop, value]) ?? [[property, value]]
  );
};

type DeepConfig = Record<
  ClassName,
  Record<ElementLocation, Record<PropertyKey, Styles>>
>;

type PreprocessedConfig = Record<ClassName, Styles>;
type Styles = Record<PropertyKey, { o: Order; v: Value; i?: Important }>;
type ClassName = string;
type PropertyKey = string;
type ElementLocation = "root" | string;
type Order = number;
// type Falsy = null | undefined | 0 | "" | false;
type Value = string;
type Important = boolean;

const flattenConfig = (config: DeepConfig): PreprocessedConfig => {
  const configEntries = Object.entries(config)
    // flat / expand locations
    .map(([className, locations]) => {
      const flatAffectedProps = Object.entries(locations).flatMap(
        ([location, props]) =>
          Object.entries(props).map(([prop, map]) => [
            location + ">>" + prop,
            map,
          ])
      );
      return [className, Object.fromEntries(flatAffectedProps)];
    });
  return Object.fromEntries(configEntries);
};

const compressConfig = (() => {
  const generateStringKey = (() => {
    const alphabet = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const specialChars = "+=_-)(*&^%$#@!~,.<>/?:;[]{}|";
    const chars = alphabet + alphabet.toUpperCase() + numbers + specialChars;
    const l = chars.length;

    let count = -1;

    return () => {
      let pointer = ++count;
      let id = "";
      let power = 1;

      let iteration = 0;
      do {
        iteration++;
        const val = pointer % l ** power;
        pointer -= val;
        const i = val / l ** (power - 1) - (pointer === 0 && power > 1 ? 1 : 0);
        const prevChar = chars[i];
        id = prevChar + id;
        power++;
      } while (pointer > 0 && iteration < 10);

      return id;
    };
  })();

  const generateNumberKey = (() => {
    let count = -1;
    return () => ++count;
  })();

  const createMinimizeKey = (keyGenerator: () => string | number) => {
    const cache = {} as Record<string | number, string | number>;
    return (key: string | number) => {
      cache[key] ??= keyGenerator();
      return cache[key];
    };
  };

  const minimizeStringKey = createMinimizeKey(generateStringKey);
  const minimizeNumberKey = createMinimizeKey(generateNumberKey);
  const minimizeBoolean = (value: boolean) => (value ? 1 : 0);

  return (config: PreprocessedConfig): CompressedConfig => {
    // TODO: replace with mapValues
    const configEntries = Object.entries(config).map(([className, props]) => {
      const entries = Object.entries(props).map(([prop, { v, i, o }]) => {
        // update keys, encode location into prop key
        return [
          minimizeStringKey(prop),
          [minimizeNumberKey(v), o].concat(i ? [1] : []),
          // {
          //   v: minimizeNumberKey(v),
          //   // avoid adding "important" to config when it's false
          //   ...(i && { i: 1 }),
          //   o,
          // },
        ];
      });
      // return [className, Object.fromEntries(e)];
      // combine / minimize entries
      const combinedEntries = entries.reduce((acc, [prop, values]) => {
        const i = acc.findIndex(([prop, ...existingValues]) =>
          valuesAreEqual(existingValues, values as PropMetadata)
        );
        if (i !== -1) {
          const entry = acc[i];
          if (typeof entry[0] === "string") entry[0] = [entry[0]];
          entry[0].push(prop as string);
        } else {
          // new entry
          // @ts-ignore
          acc.push([prop, ...values]);
        }
        return acc;
      }, [] as CompressedStyles);

      return [className, combinedEntries];
    });
    return Object.fromEntries(configEntries);
  };
})();

const valuesAreEqual = (a: PropMetadata, b: PropMetadata) =>
  a[0] === b[0] && a[1] === b[1] && a[2] === b[2];

const panic = (errorMsg: string) => {
  throw new Error(errorMsg);
};
