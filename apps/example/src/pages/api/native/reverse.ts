// TEMPLATE-ONLY:START(native)
import { reverseStringFallback } from "@myorg/external";

export default async function handleReverse(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const text = url.searchParams.get("text") ?? "hello";

  let result: string;
  let source: string;

  try {
    // @ts-expect-error — optional
    const native = await import("@myorg/native");
    if (native.reverse_string) {
      result = native.reverse_string(text);
      source = "rust";
    } else {
      throw new Error("reverse_string not in native");
    }
  } catch {
    result = reverseStringFallback(text);
    source = "js-fallback";
  }

  return Response.json({
    input: text,
    reversed: result,
    source,
  });
}
// TEMPLATE-ONLY:END(native)
