import { describe, expect, test } from "bun:test";
import { createGreeting } from "@src/greeting";

describe("createGreeting", () => {
  test("returns a greeting with the given name", () => {
    const result = createGreeting("Alice");
    expect(result.message).toBe("Hello, Alice!");
  });

  test("includes a timestamp", () => {
    const before = Date.now();
    const result = createGreeting("Bob");
    const after = Date.now();

    expect(result.timestamp).toBeGreaterThanOrEqual(before);
    expect(result.timestamp).toBeLessThanOrEqual(after);
  });

  test("handles empty string", () => {
    const result = createGreeting("");
    expect(result.message).toBe("Hello, !");
  });
});
