import fs from "fs/promises";

export const writeToFile = (path: string) => async (content: string) => {
  const split = path.split("/");
  const filePath = split.at(-1);
  const dirPath = split.slice(0, split.length - 1).join("/");
  // const dirPath = __dirname + '/../test/_generated'
  // dirPath + '/tw-config.ts'
  await tryCreateDir(dirPath);
  await fs.writeFile(
    `${dirPath}/${filePath}`,
    content
    // `export default ${JSON.stringify(data)};`
  );
};

const tryCreateDir = async (dirPath: string) => {
  try {
    // Try to access the directory
    await fs.access(dirPath);
  } catch (error) {
    // If the directory does not exist, create it
    await fs.mkdir(dirPath, { recursive: true });
  }
};
