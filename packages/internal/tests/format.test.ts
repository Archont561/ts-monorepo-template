import { describe, expect, test } from "bun:test";
import { formatLowercase, formatUppercase } from "@src/format";

describe("formatUppercase", () => {
  test.each([
    ["hello", "HELLO"],
    ["WORLD", "WORLD"],
    ["", ""],
    ["MixedCase", "MIXEDCASE"],
  ])("formats %p to %p", (input, expected) => {
    expect(formatUppercase(input)).toBe(expected);
  });
});

describe("formatLowercase", () => {
  test.each([
    ["HELLO", "hello"],
    ["world", "world"],
    ["HeLLo", "hello"],
    ["", ""],
  ])("formats %p to %p", (input, expected) => {
    expect(formatLowercase(input)).toBe(expected);
  });
});
