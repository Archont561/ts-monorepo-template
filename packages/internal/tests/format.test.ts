import { describe, expect, test } from "bun:test";
import { formatLowercase, formatUppercase } from "@src/format";

describe("formatUppercase", () => {
  test("converts lowercase to uppercase", () => {
    expect(formatUppercase("hello")).toBe("HELLO");
  });

  test("leaves uppercase unchanged", () => {
    expect(formatUppercase("WORLD")).toBe("WORLD");
  });

  test("handles empty string", () => {
    expect(formatUppercase("")).toBe("");
  });
});

describe("formatLowercase", () => {
  test("converts uppercase to lowercase", () => {
    expect(formatLowercase("HELLO")).toBe("hello");
  });

  test("leaves lowercase unchanged", () => {
    expect(formatLowercase("world")).toBe("world");
  });

  test("handles mixed case", () => {
    expect(formatLowercase("HeLLo")).toBe("hello");
  });
});
