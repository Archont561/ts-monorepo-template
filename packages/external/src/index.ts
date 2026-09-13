// Explicit named re-exports from internal.
// Avoid `export *` to prevent leaking implementation details.
export { formatUppercase, type Greeting } from "@myorg/internal";
export { greetUser, type UserProfile } from "@src/user";
