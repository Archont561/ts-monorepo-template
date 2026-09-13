import { describe, expect, test } from "bun:test";
import { handleApiIndex, handleGreet, handleHtml, handleShout } from "@src/routes";

describe("Server integration (in-process coverage)", () => {
  test("GET / returns HTML page", async () => {
    const response = await handleHtml();
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/html");

    const html = await response.text();
    expect(html).toContain("Hello, World!");
  });

  test("GET /api returns endpoints", async () => {
    const res = handleApiIndex();
    const data = await res.json();
    expect(data.message).toBe("Bun Monorepo Example");
  });

  test("GET /api/greet/:name exercises external → internal chain", async () => {
    const res = handleGreet("Alice");
    const data = await res.json();
    expect(data.greeting).toBe("Hello, Alice!");
  });

  test("GET /api/shout/:name exercises re-exported utility", async () => {
    const res = handleShout("bob");
    const data = await res.json();
    expect(data.shouted).toBe("HELLO, BOB!");
  });
});
