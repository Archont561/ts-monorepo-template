import { describe, expect, test } from "bun:test";
import { greetUser, type UserProfile } from "@src/user";

describe("greetUser", () => {
  const user: UserProfile = {
    id: "user-1",
    name: "Alice",
  };

  test("returns a greeting for the user", () => {
    expect(greetUser(user)).toBe("Hello, Alice!");
  });

  test("shouts the greeting when shout is true", () => {
    expect(greetUser(user, true)).toBe("HELLO, ALICE!");
  });

  test("defaults to non-shouted greeting", () => {
    expect(greetUser(user, false)).toBe("Hello, Alice!");
  });
});
