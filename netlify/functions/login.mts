import { login, verifyRequestOrigin } from "@netlify/identity";
export default async function (req: Request) {
  try {
    verifyRequestOrigin(req);
    if (req.method !== "POST")
      return new Response("Method not allowed", { status: 405 });
    const { username, password } = await req.json();
    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      password.length > 200
    )
      return Response.json({ error: "Invalid credentials" }, { status: 400 });
    const email =
      username === "jujiang" ? Netlify.env.get("DEMO_ACCOUNT_EMAIL") : username;
    if (!email)
      return Response.json(
        {
          error:
            "The demo account needs to be configured by the site owner. You can also register with your email.",
        },
        { status: 400 },
      );
    await login(email, password);
    return Response.json({ ok: true });
  } catch {
    return Response.json(
      {
        error:
          "Unable to sign in. Check your credentials and confirm your email.",
      },
      { status: 401 },
    );
  }
}
export const config = { path: "/api/login" };
