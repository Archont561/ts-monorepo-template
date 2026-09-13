import { createGreeting, formatUppercase } from "@myorg/internal";

export interface UserProfile {
  id: string;
  name: string;
}

export function greetUser(user: UserProfile, shout = false): string {
  const greeting = createGreeting(user.name);
  return shout ? formatUppercase(greeting.message) : greeting.message;
}
