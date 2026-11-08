import { afterEach, describe, expect, it, vi } from "vitest";
import { writeLineToConsole } from "./console-line";

// Workers Logs files each console line under the method that wrote it, so an
// error written with console.log never shows up under a `level = error` filter.
describe("writeLineToConsole", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  function spies() {
    return {
      log: vi.spyOn(console, "log").mockImplementation(() => {}),
      warn: vi.spyOn(console, "warn").mockImplementation(() => {}),
      error: vi.spyOn(console, "error").mockImplementation(() => {}),
    };
  }

  it.each([
    ["fatal", "error"],
    ["error", "error"],
    ["warn", "warn"],
    ["info", "log"],
    ["debug", "log"],
  ] as const)("writes a %s line with console.%s", (level, method) => {
    const consoleSpies = spies();
    const line = `{"level":"${level}","msg":"inline refund failed"}`;

    writeLineToConsole(`${line}\n`);

    expect(consoleSpies[method]).toHaveBeenCalledWith(line);
    for (const [name, spy] of Object.entries(consoleSpies)) {
      if (name !== method) expect(spy).not.toHaveBeenCalled();
    }
  });

  it("falls back to console.log for a line without a level", () => {
    const consoleSpies = spies();
    writeLineToConsole("not json");
    expect(consoleSpies.log).toHaveBeenCalledWith("not json");
  });
});
