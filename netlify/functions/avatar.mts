import { getUser } from "@netlify/identity";
import { getStore } from "@netlify/blobs";
export default async function (req: Request) {
  const user = await getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  const file = await getStore("avatars").getWithMetadata(user.id, {
    type: "arrayBuffer",
  });
  if (!file) return new Response("Not found", { status: 404 });
  return new Response(file.data, {
    headers: {
      "Content-Type": String(file.metadata.contentType || "image/png"),
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
export const config = { path: "/api/avatar" };
