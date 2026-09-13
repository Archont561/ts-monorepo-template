import { describe, expect, test } from "bun:test";
import { handleApiIndex, handleGreet, handleHtml, handleShout } from "@src/routes";

describe("handleHtml", () => {
  test("returns HTML content type", async () => {
    const response = await handleHtml();
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/html");
  });

  test("contains greeting div", async () => {
    const response = await handleHtml();
    const html = await response.text();
    expect(html).toContain('<div id="greeting">Hello, World!</div>');
  });

  test("contains page title", async () => {
    const response = await handleHtml();
    const html = await response.text();
    expect(html).toContain("<title>Bun Monorepo Example</title>");
  });
});

describe("handleApiIndex", () => {
  test("returns welcome message with endpoints", async () => {
    const response = handleApiIndex();
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.message).toBe("Bun Monorepo Example");
    expect(data.endpoints).toContain("/api/greet/:name");
    expect(data.endpoints).toContain("/api/shout/:name");
  });
});

describe("handleGreet", () => {
  test("returns greeting for the given name", async () => {
    const response = handleGreet("Alice");
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.greeting).toBe("Hello, Alice!");
  });

  test("handles special characters in name", async () => {
    const response = handleGreet("José");
    const data = await response.json();
    expect(data.greeting).toBe("Hello, José!");
  });
});

describe("handleShout", () => {
  test("returns uppercased greeting", async () => {
    const response = handleShout("bob");
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.shouted).toBe("HELLO, BOB!");
  });
});
