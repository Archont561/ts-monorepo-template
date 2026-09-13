import { expect, test } from "@playwright/test";

test.describe("HTML Page (Browser)", () => {
  test("renders the greeting div", async ({ page }) => {
    await page.goto("/");

    const greeting = page.locator("#greeting");
    await expect(greeting).toBeVisible();
    await expect(greeting).toHaveText("Hello, World!");
  });

  test("has correct page title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle("Bun Monorepo Example");
  });

  test("applies dark background styling", async ({ page }) => {
    await page.goto("/");

    const greeting = page.locator("#greeting");
    const bgColor = await greeting.evaluate((el) => getComputedStyle(el).backgroundColor);
    // #18181b → rgb(24, 24, 27)
    expect(bgColor).toBe("rgb(24, 24, 27)");
  });
});

test.describe("Server routes", () => {
  test("GET /health returns 200 OK (Tier 1 static route)", async ({ request }) => {
    const response = await request.get("/health");
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    expect(await response.text()).toBe("OK");
  });

  test("GET / returns HTML (Tier 2 file-based)", async ({ page }) => {
    await page.goto("/");
    const greeting = page.locator("#greeting");
    await expect(greeting).toBeVisible();
    await expect(greeting).toHaveText("Hello, World!");
  });

  test("GET /api returns endpoint list", async ({ request }) => {
    const response = await request.get("/api");
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.endpoints).toContain("/health");
    expect(data.endpoints).toContain("/api/greet/:name");
  });

  test("GET /api/greet/:name resolves and returns greeting", async ({ request }) => {
    const response = await request.get("/api/greet/Alice");
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.greeting).toBe("Hello, Alice!");
  });

  test("GET /api/shout/:name resolves and returns shouted greeting", async ({ request }) => {
    const response = await request.get("/api/shout/bob");
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.shouted).toBe("HELLO, BOB!");
  });

  test("GET /unknown returns 404", async ({ request }) => {
    const response = await request.get("/unknown");
    expect(response.status()).toBe(404);
  });
});
