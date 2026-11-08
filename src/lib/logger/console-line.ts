/* eslint-disable no-console -- the one place logs reach the Workers runtime */

const LEVEL = /"level":"(\w+)"/;

/**
 * Writes one pino JSON line to the console method that matches its level.
 * Workers Logs files each line under that method, so this is what lets an
 * error be found under `level = error`.
 */
export function writeLineToConsole(line: string): void {
  const text = line.trimEnd();
  const level = LEVEL.exec(text)?.[1];
  if (level === "fatal" || level === "error") console.error(text);
  else if (level === "warn") console.warn(text);
  else console.log(text);
}
