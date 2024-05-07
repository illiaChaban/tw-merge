const fs = require("fs");

/**

TODO: Doesn't support group yet or nested selector, 
i.e
dark:group-hover:opacity-100 ->
.dark .group:hover .dark\:group-hover\:opacity-100

group-hover:dark:opacity-100 ->
.group:hover .dark .group-hover\:dark\:opacity-100

TODO: minimize parsed - replace keys

TODO: support any order for stacked modifiers? 
i.e. sm:hover === hover:sm

TODO: performance of Set(string VS number) vs Object Vs array.includes

TODO: performance: tw-merge add caching?

TODO: performance: how much does it matter if we check the last (first) passed string for conflicts and let the linter take of conflicts

TODO: should i compare value & priority instead of just priority ?
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

const myCustomPlugin = ({
  onParsed = (data) =>
    writeConfigToFile(data, __dirname + "/../test/_generated/tw-config.ts"),
} = {}) => {
  console.log(`
  
  
  execute myCustomPlugin
  
  
  `);
  return {
    postcssPlugin: "my-custom-plugin",
    async Once(root, { result }) {
      console.log(
        ` 
      
      
      
      ONCE
      
      
      `,
        // root,
        // result
      );

      /**
       * type Parsed = {[className]: {[Key]: AffectedProperties} }
       * type Key = PseudeElementName | ''
       * TODO: do i need priority
       * type AffectedProperties = {[prop]: priority}
       */

      const parsed = {};

      /** Is keeping track of this even useful? */
      let rulePriority = 0;
      root.walkRules((rule) => {
        const isClass = rule.selector[0] === ".";
        const classCandidate = rule.raws?.tailwind?.classCandidate;
        // console.log(rule)
        // console.log({ isClass, classCandidate, raws: JSON.stringify(rule.raws ?? {}) })
        if (!isClass || !classCandidate) return;

        rulePriority++;
        const affectedProps = rule.nodes
          // ignore all "set up" props that just set up values as variables, since they can be duplicated & overriden
          // by multiple classes with no effect on final design
          // example: content: var(--tw-content)
          // filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)
          .filter((n) => n.value.replaceAll(/var\(--.+?\)/g, "").trim() !== "")
          .map((n) => n.prop);
        const affectedPropsMap = Object.fromEntries(
          affectedProps.flatMap(expandShorthand).map((p) => [p, rulePriority])
        );

        const classes = rule.selector
          .replaceAll("\\", "")
          .split(", ")
          // TODO: doesn't support nested & complex selectors
          // i.e .group:hover .dark .group-hover\:dark\:opacity-100
          .filter((v) => {
            const supported = !v.includes(" ");
            if (!supported)
              console.log(
                "ERROR: Plugin doesn't support nested & complex selectors"
              );
            return supported;
          })
          // remove "." before class name
          .map((c) => c.slice(1));

        console.log(`
          Processing rule: ${classes.join(" ")}
          affected props: ${affectedProps.join(", ")}
        `);

        classes.forEach((c) => {
          const splitter = c.startsWith(classCandidate)
            ? classCandidate
            : ":" + classCandidate;
          const [twModifiers, cssModifiers, ...rest] = c.split(
            c.startsWith(classCandidate) ? classCandidate : ":" + classCandidate
          );
          /** Classname the way it's displayed in html */
          const htmlClassName = c.slice(
            0,
            twModifiers.length + splitter.length
          );
          if (rest.length)
            throw new Error(`Rest should be empty: ${JSON.stringify(rest)}`);
          const pseudoElement = cssModifiers
            ?.split?.("::")[1]
            ?.split?.(":")?.[0];
          console.log(`
          twModifiers: ${twModifiers.split(":").join(", ")}
          pseudoElement: ${pseudoElement}
          `);

          parsed[htmlClassName] ??= {};
          /** 
          TODO: rely on css modifiers & parse media queries instead of relying to tw modifers? 
          TODO: or support different orders of tw modifiers when they evaluate to the same thing
          For now assuming that two classes are conflicting only if they modify intersecting properties with the same 
          tw modifers and on the same pseudelement (or root)
          */
          const key = [twModifiers, pseudoElement ?? "root"]
            .filter(Boolean)
            .join("::");
          parsed[htmlClassName][key] ??= {};
          parsed[htmlClassName][key] = {
            ...parsed[htmlClassName][key],
            ...affectedPropsMap,
          };
        });

        console.log(`
          raws: ${JSON.stringify(rule.raws)}
          classCandidate: ${rule.raws?.tailwind?.classCandidate}
          props: 
          ${rule.nodes.map((n) => n.prop + ": " + n.value).join(";\n ")}

        `);
      });

      // TODO: should i minimize parsed object, i.e replace all properties with autogenerated values that are shorter
      // to reduce memory usage and comparison efficiency, since it's doesn't matter what it is, as long as it's 1 to 1 mapping

      console.log(`
      
      Parsed:
      ${JSON.stringify(parsed)}
      
      
      
      `);

      const minimized = minimizeConfig(parsed);

      console.log(`
      
      
      Minimized:
      ${JSON.stringify(minimized)}
      
      
      
      `);

      await onParsed(minimized);

      console.log("Saved!");
    },
  };
};
myCustomPlugin.postcss = true;

const expandShorthand = (property) => {
  // TODO: extend this
  const shorthands = {
    padding: ["padding-top", "padding-right", "padding-bottom", "padding-left"],
  };
  return shorthands[property] ?? [property];
};

const tryCreateDir = (dirPath) => {
  try {
    // Try to access the directory
    fs.accessSync(dirPath);
  } catch (error) {
    // If the directory does not exist, create it
    fs.mkdirSync(dirPath, { recursive: true });
    // console.log('Directory created:', dirPath);
  }
};

export const writeConfigToFile = (data, path) => {
  const split = path.split("/");
  const filePath = split.at(-1);
  const dirPath = split.slice(0, split.length - 1).join("/");
  // const dirPath = __dirname + '/../test/_generated'
  // dirPath + '/tw-config.ts'
  tryCreateDir(dirPath);
  fs.writeFileSync(
    `${dirPath}/${filePath}`,
    `export default ${JSON.stringify(data)};`
  );
};

const minimizeConfig = (() => {
  const generateStringKey = (() => {
    const alphabet = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const specialChars = "+=_-)(*&^%$#@!~,.<>/?:;[]{}|";
    const chars = alphabet + alphabet.toUpperCase() + numbers + specialChars;
    const l = chars.length;
    // let pointer = -1
    // let prefix = ''

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
        // console.log({ val, pointer: pointer + val, power, id, iteration })
        power++;
      } while (pointer > 0 && iteration < 10);

      return id;
    };
  })();

  const generateNumberKey = (() => {
    let count = -1;
    return () => ++count;
  })();

  const minimizeKey = (() => {
    const cache = {};
    return (key) => {
      // cache[key] ??= generateNumberKey()
      cache[key] ??= generateStringKey();
      return cache[key];
    };
  })();
  return (config) => {
    /**
      map {
        [className]: {
          [location]: {
            [prop]: order
          }
        }
      } to {
        [className]: {
          [prop-key]: order
        }
      }

    */
    // _(
    //   config,
    //   mapValues(locations => {
    //     _(
    //       locations,
    //       entries,
    //       // flat / expand entries
    //       flatMap(([location, props]) => _(
    //         props,
    //         entries,
    //         map(prop => [location + '>>' + prop, order])
    //       )),
    //       fromEntries,
    //       // minimize keys
    //       keyBy((v, k) => minimizeKey(k))
    //     )
    //   }),
    // )

    const configEntries = Object.entries(config)
      // flat / expand locations
      .map(([className, locations]) => {
        const flatAffectedProps = Object.entries(locations).flatMap(
          ([location, props]) => {
            // update keys, encode location into prop key
            return Object.entries(props).map(([prop, order]) => [
              minimizeKey(location + ">>" + prop),
              order,
            ]);
          }
        );
        return [className, Object.fromEntries(flatAffectedProps)];
      });
    return Object.fromEntries(configEntries);
  };
})();

module.exports = myCustomPlugin;
