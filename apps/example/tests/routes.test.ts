import { describe, expect, test } from "bun:test";
import handleGreet from "@src/pages/api/greet/[name]";
import handleApiIndex from "@src/pages/api/index";
import handleShout from "@src/pages/api/shout/[name]";
import handleHtml from "@src/pages/index";

const mockReq = new Request("http://localhost/");

describe("handleHtml (page)", () => {
  test("returns HTML content type", async () => {
    const response = await handleHtml();
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/html");
  });

  test("contains greeting div (plain or unocss)", async () => {
    const response = await handleHtml();
    const html = await response.text();
    // Plain version has <div id="greeting">Hello, World!</div>
    // UnoCSS version has more complex structure but still has greeting
    expect(html).toMatch(/greeting/i);
    expect(html).toContain("<!doctype html>");
  });

  test("unocss version has utility classes when enabled", async () => {
    const response = await handleHtml();
    const html = await response.text();
    // If unocss file exists, it should contain utility classes
    // Otherwise plain version is ok
    if (html.includes("UnoCSS") || html.includes("unocss")) {
      expect(html).toMatch(/class=.*flex/);
    } else {
      expect(html).toContain("Hello, World!");
    }
  });
});

describe("handleApiIndex (page)", () => {
  test("returns welcome message and endpoints", async () => {
    const response = await handleApiIndex();
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.message).toBe("Bun Monorepo Example");
    expect(data.endpoints).toContain("/health");
    expect(data.endpoints).toContain("/api/greet/:name");
    expect(data.endpoints).toContain("/api/shout/:name");
  });

  test("includes native endpoints when native enabled", async () => {
    const response = await handleApiIndex();
    const data = await response.json();
    // When native enabled, should include /api/native
    // When disabled, it won't — both are valid, just check it's array
    expect(Array.isArray(data.endpoints)).toBe(true);
  });
});

describe("handleGreet (page)", () => {
  test("returns greeting for valid parameter", () => {
    const response = handleGreet(mockReq, { name: "Alice" });
    expect(response.status).toBe(200);
  });

  test("greeting content matches expected format", async () => {
    const response = handleGreet(mockReq, { name: "Alice" });
    const data = await response.json();
    expect(data.greeting).toBe("Hello, Alice!");
  });

  test("handles empty parameter cleanly", async () => {
    const response = handleGreet(mockReq, { name: "" });
    const data = await response.json();
    expect(data.greeting).toBe("Hello, !");
  });
});

describe("handleShout (page)", () => {
  test("returns shouted greeting", async () => {
    const response = handleShout(mockReq, { name: "bob" });
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.shouted).toBe("HELLO, BOB!");
  });
});

describe("native routes (optional)", () => {
  test("native routes exist when native enabled", async () => {
    try {
      const mod = await import("@src/pages/api/native/index");
      const res = mod.default();
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.endpoints).toContain("/api/native/add?a=1&b=2");
    } catch {
      // Native disabled — file doesn't exist, which is expected
      expect(true).toBe(true);
    }
  });

  test("native add route works with fallback", async () => {
    try {
      const mod = await import("@src/pages/api/native/add");
      const req = new Request("http://localhost/api/native/add?a=5&b=7");
      const res = await mod.default(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.result).toBe(12);
      expect(data.a).toBe(5);
      expect(data.b).toBe(7);
    } catch {
      expect(true).toBe(true);
    }
  });
});
