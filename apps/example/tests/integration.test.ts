import { describe, expect, test } from "bun:test";
import { resolve } from "node:path";
import { FileSystemRouter } from "bun";

const router = new FileSystemRouter({
  style: "nextjs",
  dir: resolve(import.meta.dir, "../src/pages"),
});

describe("FileSystemRouter integration", () => {
  test("GET / resolves to pages/index.ts", async () => {
    const req = new Request("http://localhost/");
    const match = router.match(req);
    expect(match).not.toBeNull();
    expect(match!.name).toBe("/");

    const mod = await import(match!.filePath);
    const res = await mod.default(req, match!.params);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/html");
  });

  test("GET /api resolves to pages/api/index.ts", async () => {
    const req = new Request("http://localhost/api");
    const match = router.match(req);
    expect(match).not.toBeNull();
    expect(match!.name).toBe("/api");

    const mod = await import(match!.filePath);
    const res = await mod.default(req, match!.params);
    const data = await res.json();
    expect(data.message).toBe("Bun Monorepo Example");
  });

  test("GET /api/greet/Alice extracts params correctly", async () => {
    const req = new Request("http://localhost/api/greet/Alice");
    const match = router.match(req);
    expect(match).not.toBeNull();
    expect(match!.kind).toBe("dynamic");
    expect(match!.params.name).toBe("Alice");

    const mod = await import(match!.filePath);
    const res = await mod.default(req, match!.params);
    const data = await res.json();
    expect(data.greeting).toBe("Hello, Alice!");
  });

  test("GET /api/shout/bob extracts params correctly", async () => {
    const req = new Request("http://localhost/api/shout/bob");
    const match = router.match(req);
    expect(match).not.toBeNull();
    expect(match!.params.name).toBe("bob");

    const mod = await import(match!.filePath);
    const res = await mod.default(req, match!.params);
    const data = await res.json();
    expect(data.shouted).toBe("HELLO, BOB!");
  });

  test("GET /unknown returns null match", () => {
    const req = new Request("http://localhost/unknown");
    const match = router.match(req);
    expect(match).toBeNull();
  });
});
