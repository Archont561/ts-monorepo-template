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
  test.each([
    [1, 2, 3],
    [-1, 1, 0],
    [0, 0, 0],
    [10, 25, 35],
  ])("addFallback(%p, %p) === %p", (a, b, expected) => {
    expect(addFallback(a, b)).toBe(expected);
  });

  test("addSync uses fallback when native not loaded", () => {
    // Initially native not loaded, should fallback
    expect(addSync(2, 3)).toBe(5);
  });

  test("add async uses fallback", async () => {
    expect(await add(2, 3)).toBe(5);
  });

  test.each([
    [0, 0],
    [1, 1],
    [2, 1],
    [3, 2],
    [4, 3],
    [5, 5],
    [10, 55],
  ])("fibonacciFallback(%p) === %p", (n, expected) => {
    expect(fibonacciFallback(n)).toBe(expected);
  });

  test("fibonacciSync fallback", () => {
    expect(fibonacciSync(10)).toBe(55);
  });

  test("fibonacci async fallback", async () => {
    expect(await fibonacci(10)).toBe(55);
  });

  test.each([
    ["hello", "olleh"],
    ["", ""],
    ["racecar", "racecar"],
    ["Bun monorepo", "operonom nuB"],
  ])("reverseStringFallback(%p) === %p", (str, expected) => {
    expect(reverseStringFallback(str)).toBe(expected);
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
