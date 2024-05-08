/**
 * TODO: remove
 * @deprecated  */
export const logWhen =
  (condition: unknown) =>
  (...args: any[]) => {
    if (condition) console.log(...args);
  };
