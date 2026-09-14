/**
 * Port the example server listens on — and the one E2E tests point at.
 *
 * Override it with the `PORT` environment variable (compose, devcontainer, CI);
 * `DEFAULT_PORT` is what the E2E config and the docs quote.
 * It lives in its own module so the app and `playwright.config.ts` cannot drift
 * apart, without the config having to import the server (and its native
 * bindings) just to read a number.
 */
export const DEFAULT_PORT = 3000;

export const PORT = Number(process.env.PORT ?? DEFAULT_PORT);
