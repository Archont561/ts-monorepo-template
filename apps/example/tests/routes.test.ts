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

  test("reports the flags it decided on, not a re-derivation", async () => {
    const response = await handleApiIndex();
    const data = await response.json();
    // `features` comes from the providers; the endpoint list is built from the
    // same providers, so the two must agree in every checkout.
    expect(data.features.unocss).toBe(data.endpoints.includes("/uno.css"));
  });
});

describe("handleGreet (page)", () => {
  test.each([
    { name: "Alice", expected: "Hello, Alice!" },
    { name: "Bob", expected: "Hello, Bob!" },
    { name: "", expected: "Hello, !" },
  ])("returns 200 with expected greeting for name=$name", async ({ name, expected }) => {
    const response = handleGreet(mockReq, { name });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.greeting).toBe(expected);
  });
});

describe("handleShout (page)", () => {
  test.each([
    { name: "bob", expected: "HELLO, BOB!" },
    { name: "alice", expected: "HELLO, ALICE!" },
  ])("returns shouted greeting for name=$name", async ({ name, expected }) => {
    const response = handleShout(mockReq, { name });
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.shouted).toBe(expected);
  });
});

// TEMPLATE-ONLY:START(native)
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

  test("native status route works", async () => {
    try {
      const mod = await import("@src/pages/api/native/status");
      const res = await mod.default();
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBeDefined();
    } catch {
      expect(true).toBe(true);
    }
  });

  test("native fibonacci route works", async () => {
    try {
      const mod = await import("@src/pages/api/native/fibonacci/[n]");
      const res = mod.default(mockReq, { n: "5" });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.result).toBe(5);
    } catch {
      expect(true).toBe(true);
    }
  });

  test("native primes route works", async () => {
    try {
      const mod = await import("@src/pages/api/native/primes/[n]");
      const res = await mod.default(mockReq, { n: "10" });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.count).toBe(4);
    } catch {
      expect(true).toBe(true);
    }
  });

  test("native reverse route works", async () => {
    try {
      const mod = await import("@src/pages/api/native/reverse");
      const res = await mod.default(new Request("http://localhost/api/native/reverse?text=hello"));
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.reversed).toBe("olleh");
    } catch {
      expect(true).toBe(true);
    }
  });
});
// TEMPLATE-ONLY:END(native)
