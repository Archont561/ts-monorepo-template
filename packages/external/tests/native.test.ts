import { describe, expect, test } from "bun:test";
import {
  add,
  addFallback,
  addSync,
  fibonacci,
  fibonacciFallback,
  fibonacciSync,
  getNativeBinding,
  isNativeAvailable,
  reverseString,
  reverseStringFallback,
} from "@src/native";

describe("native fallback", () => {
  test("addFallback", () => {
    expect(addFallback(1, 2)).toBe(3);
    expect(addFallback(-1, 1)).toBe(0);
  });

  test("addSync uses fallback when native not loaded", () => {
    // Initially native not loaded, should fallback
    expect(addSync(2, 3)).toBe(5);
  });

  test("add async uses fallback", async () => {
    expect(await add(2, 3)).toBe(5);
  });

  test("fibonacciFallback", () => {
    expect(fibonacciFallback(0)).toBe(0);
    expect(fibonacciFallback(1)).toBe(1);
    expect(fibonacciFallback(10)).toBe(55);
  });

  test("fibonacciSync fallback", () => {
    expect(fibonacciSync(10)).toBe(55);
  });

  test("fibonacci async fallback", async () => {
    expect(await fibonacci(10)).toBe(55);
  });

  test("reverseStringFallback", () => {
    expect(reverseStringFallback("hello")).toBe("olleh");
    expect(reverseStringFallback("")).toBe("");
  });

  test("reverseString async fallback", async () => {
    expect(await reverseString("hello")).toBe("olleh");
  });

  test("isNativeAvailable returns boolean", () => {
    expect(typeof isNativeAvailable()).toBe("boolean");
  });

  test("getNativeBinding attempts load (may be null)", async () => {
    const binding = await getNativeBinding();
    // binding may be null if .node not built, or object if built
    expect(binding === null || typeof binding === "object").toBe(true);
  });
});
