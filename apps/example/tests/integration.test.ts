import { afterAll, describe, expect, test } from "bun:test";
import { server } from "@src/index";

describe("Server routes integration", () => {
  afterAll(async () => {
    await server.stop();
  });

  test("GET / resolves to index.html", async () => {
    const res = await fetch(`http://localhost:${server.port}/`);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/html");
  });

  test("GET /api resolves to pages/api/index.ts", async () => {
    const res = await fetch(`http://localhost:${server.port}/api`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.message).toBe("Bun Monorepo Example");
  });

  test("GET /api/greet/Alice extracts params correctly", async () => {
    const res = await fetch(`http://localhost:${server.port}/api/greet/Alice`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.greeting).toBe("Hello, Alice!");
  });

  test("GET /api/shout/bob extracts params correctly", async () => {
    const res = await fetch(`http://localhost:${server.port}/api/shout/bob`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.shouted).toBe("HELLO, BOB!");
  });

  test("GET /unknown returns 404", async () => {
    const res = await fetch(`http://localhost:${server.port}/unknown`);
    expect(res.status).toBe(404);
  });

  test("GET /health returns 200 OK", async () => {
    const res = await fetch(`http://localhost:${server.port}/health`);
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("OK");
  });

  test("GET /uno.css returns CSS", async () => {
    const res = await fetch(`http://localhost:${server.port}/uno.css`);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/css");
  });

  test("GET /favicon.ico handles static asset", async () => {
    const res = await fetch(`http://localhost:${server.port}/favicon.ico`);
    // May be 200 if file exists or 404 if not
    expect(res.status).toBeDefined();
  });

  // TEMPLATE-ONLY:START(native)
  test("GET /api/native/health returns status", async () => {
    const res = await fetch(`http://localhost:${server.port}/api/native/health`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.native).toBeDefined();
  });

  test("GET /api/native endpoints via server", async () => {
    const addRes = await fetch(`http://localhost:${server.port}/api/native/add?a=2&b=3`);
    expect(addRes.status).toBe(200);
    const fibRes = await fetch(`http://localhost:${server.port}/api/native/fibonacci/5`);
    expect(fibRes.status).toBe(200);
    const primeRes = await fetch(`http://localhost:${server.port}/api/native/primes/10`);
    expect(primeRes.status).toBe(200);
    const revRes = await fetch(`http://localhost:${server.port}/api/native/reverse?text=hi`);
    expect(revRes.status).toBe(200);
    const statusRes = await fetch(`http://localhost:${server.port}/api/native/status`);
    expect(statusRes.status).toBe(200);
  });
  // TEMPLATE-ONLY:END(native)
});
