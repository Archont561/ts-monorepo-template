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

  test("contains greeting div", async () => {
    const response = await handleHtml();
    const html = await response.text();
    expect(html).toContain('<div id="greeting">Hello, World!</div>');
  });
});

describe("handleApiIndex (page)", () => {
  test("returns welcome message and endpoints", async () => {
    const response = handleApiIndex();
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.message).toBe("Bun Monorepo Example");
    expect(data.endpoints).toContain("/health");
    expect(data.endpoints).toContain("/api/greet/:name");
    expect(data.endpoints).toContain("/api/shout/:name");
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
