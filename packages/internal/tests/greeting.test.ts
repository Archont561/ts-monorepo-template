import { describe, expect, test } from "bun:test";
import { createGreeting } from "@/src/greeting";

describe("createGreeting", () => {
  test.each([
    ["Alice", "Hello, Alice!"],
    ["Bob", "Hello, Bob!"],
    ["", "Hello, !"],
  ])("creates greeting for %p -> %p", (name, expectedMessage) => {
    const result = createGreeting(name);
    expect(result.message).toBe(expectedMessage);
    expect(result.timestamp).toBeGreaterThan(0);
  });

  test("includes a timestamp within the execution window", () => {
    const before = Date.now();
    const result = createGreeting("Bob");
    const after = Date.now();

    expect(result.timestamp).toBeGreaterThanOrEqual(before);
    expect(result.timestamp).toBeLessThanOrEqual(after);
  });
});
