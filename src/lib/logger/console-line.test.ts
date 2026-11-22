import { afterEach, describe, expect, it, vi } from "vitest";
import { writeLineToConsole } from "./console-line";

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
