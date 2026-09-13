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

test.describe("API Routes (HTTP)", () => {
  test("GET /api returns welcome message", async ({ request }) => {
    const response = await request.get("/api");
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.message).toBe("Bun Monorepo Example");
    expect(data.endpoints).toContain("/api/greet/:name");
    expect(data.endpoints).toContain("/api/shout/:name");
  });

  test("GET /api/greet/:name returns greeting via external → internal chain", async ({
    request,
  }) => {
    const response = await request.get("/api/greet/Alice");
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.greeting).toBe("Hello, Alice!");
  });

  test("GET /api/shout/:name returns uppercased greeting", async ({ request }) => {
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
