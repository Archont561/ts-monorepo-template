import { formatUppercase } from "@myorg/external";

export default function handleShout(_req: Request, params: Record<string, string>): Response {
  const name = params.name ?? "";
  return Response.json({ shouted: formatUppercase(`Hello, ${name}!`) });
}
