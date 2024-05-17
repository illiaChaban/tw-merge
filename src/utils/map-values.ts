export const mapValues = <K extends string, T, Y>(
  obj: Record<K, T>,
  map: (value: T, key: K) => Y
): Record<K, Y> => {
  const mapped = {} as Record<K, Y>;
  const keys = Object.keys(obj) as K[];
  keys.forEach((key) => {
    mapped[key] = map(obj[key], key);
  });
  return mapped;
};
