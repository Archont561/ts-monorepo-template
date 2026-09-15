import { describe, expect, test } from "bun:test";
import { greetUser, type UserProfile } from "@/src/user";

describe("greetUser", () => {
  const user: UserProfile = {
    id: "user-1",
    name: "Alice",
  };

  test.each([
    { shout: undefined, expected: "Hello, Alice!" },
    { shout: false, expected: "Hello, Alice!" },
    { shout: true, expected: "HELLO, ALICE!" },
  ])("returns $expected when shout is $shout", ({ shout, expected }) => {
    expect(greetUser(user, shout)).toBe(expected);
  });
});
