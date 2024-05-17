/**
 * TODO: remove
 * @deprecated  */
export const logWhen = (condition: unknown) => {
  /**
   * TODO: remove
   * @deprecated  */
  const logger = (...args: any[]) => {
    if (condition) console.log(...args);
  };
  return logger;
};
