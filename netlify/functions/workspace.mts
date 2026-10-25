import { getUser } from "@netlify/identity";
import { getDatabase } from "@netlify/database";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
export default async function (req: Request) {
  const user = await getUser();
  if (!user)
    return new Response("Sign in to open your workspace.", { status: 401 });
  try {
    const { rows } = await getDatabase().pool.query(
      "SELECT state FROM profiles WHERE id=$1",
      [user.id],
    );
    const state = rows[0]?.state?.legacy;
    const key = "fan-quest-workspace:" + user.id;
    const safe = (v: any) => JSON.stringify(v).replace(/</g, "\\u003c");
    let html = await readFile(join(process.cwd(), "legacy.html"), "utf8");
    html = html.replace(
      "const LOCAL_KEY='fandom-wallet-v1';",
      `const LOCAL_KEY=${safe(key)};`,
    );
    const bootstrap = `<script>\n${state ? `localStorage.setItem(${safe(key)},${safe(JSON.stringify(state))});` : ""}\nlet syncQueue=null,syncTimer=null,syncBusy=false;\nfunction syncWorkspace(value){syncQueue=value;clearTimeout(syncTimer);syncTimer=setTimeout(flushWorkspace,600);}\nasync function flushWorkspace(){if(syncBusy||!syncQueue)return;syncBusy=true;const legacy=syncQueue;syncQueue=null;try{const r=await fetch('/api/quest',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'legacy',legacy,requestId:crypto.randomUUID()})});if(!r.ok)throw Error();parent.postMessage({type:'legacy-status',ok:true},location.origin);}catch{if(!syncQueue)syncQueue=legacy;parent.postMessage({type:'legacy-status',ok:false},location.origin);}finally{syncBusy=false;if(syncQueue)syncTimer=setTimeout(flushWorkspace,4000);}}\naddEventListener('pagehide',()=>{if(syncQueue)fetch('/api/quest',{method:'POST',keepalive:true,headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'legacy',legacy:syncQueue,requestId:crypto.randomUUID()})}).catch(()=>{});});\nparent.postMessage({type:'legacy-status',ok:true},location.origin);\n</script>`;
    html = html.replace("<script>", () => bootstrap + "<script>");
    html = html.replace(
      "localStorage.setItem(LOCAL_KEY,JSON.stringify(o))",
      "localStorage.setItem(LOCAL_KEY,JSON.stringify(o));syncWorkspace(o)",
    );
    html = html.replace("Saved on this device", "Account workspace");
    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return new Response(
      "Workspace is temporarily unavailable. Please refresh after deployment.",
      { status: 503 },
    );
  }
}
export const config = { path: "/api/workspace" };
