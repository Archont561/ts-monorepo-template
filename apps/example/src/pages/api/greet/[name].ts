import { greetUser, type UserProfile } from "@myorg/external";

export default function handleGreet(_req: Request, params: Record<string, string>): Response {
  const user: UserProfile = {
    id: crypto.randomUUID(),
    name: params.name ?? "",
  };
  return Response.json({ greeting: greetUser(user) });
}
