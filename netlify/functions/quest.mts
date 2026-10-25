import { getUser, verifyRequestOrigin } from "@netlify/identity";
import { getDatabase } from "@netlify/database";
import { getStore } from "@netlify/blobs";
import { database } from "../../db/index";
import { profiles } from "../../db/schema";
import { initialState, defaultAvatar, dailyGame } from "../../shared/catalog";
import {
  startGame,
  publicRun,
  gameAction,
  gameReward,
  validateAvatar,
  validateSettings,
  dailyClaim,
  missionClaim,
  redeem,
  requireThat,
  settleGame,
  achievementClaim,
} from "../../shared/engine";
import { randomUUID } from "node:crypto";
export default async function (req: Request) {
  const user = await getUser();
  if (!user)
    return Response.json({ error: "Please sign in again." }, { status: 401 });
  if (!["GET", "POST"].includes(req.method))
    return new Response("Method not allowed", { status: 405 });
  if (req.method === "POST") {
    try {
      verifyRequestOrigin(req);
    } catch {
      return new Response("Forbidden", { status: 403 });
    }
  }
  let client: any;
  try {
    await database()
      .insert(profiles)
      .values({
        id: user.id,
        name: String(user.name || "Fan explorer").slice(0, 40),
        state: initialState(),
      })
      .onConflictDoNothing();
    client = await getDatabase().pool.connect();
    await client.query("BEGIN");
    const {
      rows: [p],
    } = await client.query("SELECT * FROM profiles WHERE id=$1 FOR UPDATE", [
      user.id,
    ]);
    const s = p.state;
    const day = new Date().toISOString().slice(0, 10);
    let amount = 0,
      description = "",
      result: any = null;
    if (req.method === "POST") {
      requireThat(
        Number(req.headers.get("content-length") || 0) < 2200000,
        "Request too large",
      );
      const input = await req.json();
      const { action } = input;
      requireThat(
        typeof input.requestId === "string" &&
          /^[a-f0-9-]{36}$/.test(input.requestId),
        "Invalid request ID",
      );
      const receiptId = user.id + ":" + input.requestId;
      const prior = await client.query(
        "SELECT result FROM receipts WHERE id=$1 AND user_id=$2",
        [receiptId, user.id],
      );
      if (prior.rows.length) {
        result = prior.rows[0].result;
      } else {
        if (action === "name") {
          requireThat(
            typeof input.name === "string" &&
              input.name.trim().length > 0 &&
              input.name.length <= 40,
            "Invalid name",
          );
          p.name = input.name.trim();
          await client.query("UPDATE profiles SET name=$1 WHERE id=$2", [
            p.name,
            user.id,
          ]);
        } else if (action === "legacy") {
          requireThat(
            input.legacy &&
              typeof input.legacy === "object" &&
              !Array.isArray(input.legacy) &&
              JSON.stringify(input.legacy).length < 1000000,
            "Invalid workspace backup",
          );
          s.legacy = input.legacy;
        } else if (action === "daily") {
          amount = dailyClaim(s, day);
          description = "Daily login reward";
        } else if (action === "achievement") {
          amount = achievementClaim(s, input.id);
          description = "Achievement bonus";
        } else if (action === "mission") {
          amount = missionClaim(s, day, input.id);
          description = "Daily mission: " + input.id;
        } else if (action === "avatar") {
          s.avatar = validateAvatar(input.avatar, s.inventory);
          s.styleDay = day;
        } else if (action === "reset") {
          s.avatar = defaultAvatar();
          s.customImage = false;
        } else if (action === "preset") {
          requireThat(s.presets.length < 8, "You can save up to 8 looks");
          s.presets.push({
            id: randomUUID(),
            name: String(input.name || "Saved look").slice(0, 40),
            avatar: s.avatar,
          });
        } else if (action === "deletePreset") {
          s.presets = s.presets.filter((v: any) => v.id !== input.id);
        } else if (action === "settings") {
          s.settings = validateSettings(input.settings);
        } else if (action === "buy" || action === "box") {
          const r = redeem(s, p.balance, input.id, action === "box", day);
          amount = r.amount;
          result = r;
          description =
            (action === "box" ? "Blind box: " : "Cosmetic: ") + r.item.name;
        } else if (action === "start") {
          s.run = startGame(input.kind, input.difficulty);
        } else if (action === "move") {
          gameAction(s.run, input);
          if (s.run.done) {
            amount = settleGame(s, day);
            description = s.run.kind + " game reward";
          }
        } else if (action === "upload") {
          requireThat(
            typeof input.image === "string" && input.image.length < 1500000,
            "Image must be under 1 MB",
          );
          const m = input.image.match(
            /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/=]+)$/,
          );
          requireThat(m, "Use a PNG, JPEG or WebP");
          const b = Buffer.from(m[2], "base64");
          requireThat(b.length <= 1048576, "Image must be under 1 MB");
          requireThat(
            m[1] === "png"
              ? b
                  .subarray(0, 8)
                  .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
              : m[1] === "jpeg"
                ? b[0] === 255 && b[1] === 216 && b[2] === 255
                : b.toString("ascii", 0, 4) === "RIFF" &&
                  b.toString("ascii", 8, 12) === "WEBP",
            "Invalid image file",
          );
          await getStore("avatars").set(
            user.id,
            b.buffer.slice(
              b.byteOffset,
              b.byteOffset + b.byteLength,
            ) as ArrayBuffer,
            { metadata: { contentType: "image/" + m[1] } },
          );
          s.customImage = true;
          s.imageVersion = randomUUID();
        } else if (action === "removeImage") {
          await getStore("avatars").delete(user.id);
          s.customImage = false;
        } else throw new Error("Unknown action");
        if (amount) {
          requireThat(p.balance + amount >= 0, "Not enough Fan Points");
          p.balance += amount;
          await client.query(
            "INSERT INTO transactions (id,user_id,amount,description) VALUES ($1,$2,$3,$4)",
            [randomUUID(), user.id, amount, description],
          );
        }
        await client.query(
          "UPDATE profiles SET state=$1,balance=$2 WHERE id=$3",
          [JSON.stringify(s), p.balance, user.id],
        );
        await client.query(
          "INSERT INTO receipts (id,user_id,result) VALUES ($1,$2,$3)",
          [receiptId, user.id, JSON.stringify(result)],
        );
      }
    }
    const { legacy: legacySnapshot, ...publicState } = s;
    const { rows: history } = await client.query(
      "SELECT amount,description,created_at FROM transactions WHERE user_id=$1 ORDER BY created_at DESC LIMIT 50",
      [user.id],
    );
    await client.query("COMMIT");
    return Response.json(
      {
        name: p.name,
        balance: p.balance,
        state: { ...publicState, run: publicRun(s.run) },
        history,
        result,
        day,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    if (client) await client.query("ROLLBACK").catch(() => {});
    const message = e instanceof Error ? e.message : "";
    const safe =
      /^(Already|Mission|Complete|Not enough|You |Unknown|Invalid|Choose|Equip|Start|This game|Move |Cannot|Game |Pause|Resume|Time |Slow|Target|The timer|Image |Use a|Request)/.test(
        message,
      );
    return Response.json(
      {
        error: safe
          ? message
          : "Unable to save your adventure. Please try again.",
      },
      { status: safe ? 400 : 503 },
    );
  } finally {
    client?.release();
  }
}
export const config = { path: "/api/quest" };
