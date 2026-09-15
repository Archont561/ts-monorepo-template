import { describe, expect, test } from "bun:test";
import { formatUppercase, greetUser, type UserProfile } from "@/src/index";

describe("external package public API", () => {
  test("exports greetUser", () => {
    const user: UserProfile = { id: "1", name: "Bob" };
    expect(greetUser(user)).toBe("Hello, Bob!");
  });

  test("re-exports formatUppercase from internal", () => {
    expect(formatUppercase("hello")).toBe("HELLO");
  });
});
