import { catalog } from "../shared/catalog";
export function avatar(a: any, custom = false, version = "") {
  if (custom)
    return `<img class="custom-avatar" src="/api/avatar?v=${encodeURIComponent(version)}" alt="Your uploaded avatar">`;
  const item = (c: string) => catalog.find((i) => i.id === a[c]);
  const fur = a.fur || item("Character")?.color || "#f5e9e5",
    bg = item("Background")?.color || "#e3eddf",
    hair = a.hairColor || item("Hair")?.color || "#a27869",
    eye = a.eye || "#514247";
  const dress = item("Dress"),
    top = item("Top"),
    bottom = item("Bottom");
  return `<svg class="avatar-art ${a.Pose === "dance" ? "dancing" : ""}" viewBox="0 0 360 360" role="img" aria-label="Your ${item("Character")?.name || "Mochi"} avatar"><defs><pattern id="daisies" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M30 15v10m0 10v10M15 30h10m10 0h10" stroke="white" stroke-width="5" stroke-linecap="round" opacity=".5"/></pattern></defs><rect x="8" y="8" width="344" height="344" rx="170" fill="${bg}"/><rect x="8" y="8" width="344" height="344" rx="170" fill="url(#daisies)"/><ellipse cx="180" cy="312" rx="83" ry="13" fill="#667e6c" opacity=".12"/>
 ${a.Wings ? '<path d="M139 220Q35 125 62 248Q75 294 143 261M221 220Q325 125 298 248Q285 294 217 261" fill="#d2e2ef" stroke="#afc7dc" stroke-width="3"/>' : ""}
 ${a.Character === "bunny" ? `<path d="M126 142Q76 21 122 29Q156 41 154 143M206 143Q202 34 239 29Q276 26 236 151" fill="${fur}" stroke="#826e72" stroke-width="3"/><path d="M128 119Q103 49 121 48Q135 53 137 122M220 120Q220 51 238 47Q251 48 231 125" fill="#edbdc7"/>` : a.Character === "cat" ? `<path d="M107 161L96 81L156 125M205 124L265 81L253 162" fill="${fur}" stroke="#826e72" stroke-width="3"/>` : `<circle cx="119" cy="117" r="33" fill="${fur}" stroke="#826e72" stroke-width="3"/><circle cx="241" cy="117" r="33" fill="${fur}" stroke="#826e72" stroke-width="3"/>`}
 <ellipse cx="180" cy="252" rx="60" ry="63" fill="${fur}" stroke="#826e72" stroke-width="3"/>
 ${bottom && !dress ? `<path d="M124 267h112l10 30H114z" fill="${bottom.color}" stroke="#826e72" stroke-width="2"/>` : ""}
 ${top || dress ? `<path d="M142 211L119 227L103 259L126 268L135 250L${dress ? "119 300H241L225" : "225"} 250L234 268L257 259L241 227L218 211Q180 232 142 211" fill="${(dress || top).color}" stroke="#826e72" stroke-width="2"/><path d="M167 220q13 15 26 0" fill="none" stroke="#fff8ed" stroke-width="4"/>` : ""}
 <ellipse cx="180" cy="163" rx="83" ry="67" fill="${fur}" stroke="#826e72" stroke-width="3"/>
 ${a.Hair ? `<path d="M103 153Q103 89 180 96Q255 91 258 151Q232 144 217 120Q196 150 175 123Q150 152 135 130Q124 151 103 153" fill="${hair}"/>${a.Hair === "long" ? `<path d="M105 153Q76 226 123 242L133 215L122 154M253 153Q284 226 237 242L227 215L238 154" fill="${hair}"/>` : ""}` : ""}
 <ellipse cx="147" cy="170" rx="6" ry="9" fill="${eye}"/><ellipse cx="213" cy="170" rx="6" ry="9" fill="${eye}"/><circle cx="145" cy="167" r="2" fill="white"/><circle cx="211" cy="167" r="2" fill="white"/><ellipse cx="131" cy="188" rx="13" ry="7" fill="#e6a5af" opacity=".65"/><ellipse cx="229" cy="188" rx="13" ry="7" fill="#e6a5af" opacity=".65"/><path d="M175 184q5 6 10 0M180 188q-8 14-16 4m16-4q8 14 16 4" fill="none" stroke="#826e72" stroke-width="2.5" stroke-linecap="round"/>
 ${a.Glasses ? '<g fill="none" stroke="#76647d" stroke-width="3"><circle cx="147" cy="171" r="20"/><circle cx="213" cy="171" r="20"/><path d="M167 168q13-7 26 0M104 164l23 3M233 167l23-3"/></g>' : ""}
 ${a.Hat === "beret" ? '<path d="M113 123Q109 67 188 76Q251 84 247 125Q181 105 113 123" fill="#ca7f98" stroke="#9e6379" stroke-width="3"/><path d="M180 78l5-13" stroke="#9e6379" stroke-width="6" stroke-linecap="round"/>' : a.Hat === "crown" ? '<path d="M139 106l-8-40 30 17 19-28 20 28 29-17-8 40z" fill="#e3bc64" stroke="#b28e42" stroke-width="3"/>' : ""}
 ${a.Jewellery ? '<path d="M153 219q27 30 54 0" fill="none" stroke="#c59d50" stroke-width="3"/><path d="M180 246q-13-10-7-14q7-4 7 3q0-7 7-3q6 4-7 14" fill="#c59d50"/>' : ""}
 ${a.Bag ? '<path d="M218 222l-67 65" stroke="#9c7c61" stroke-width="5"/><rect x="135" y="266" width="33" height="30" rx="8" fill="#bfa184" stroke="#9c7c61" stroke-width="2"/>' : ""}
 <ellipse cx="149" cy="307" rx="22" ry="11" fill="${item("Shoes")?.color || fur}"/><ellipse cx="211" cy="307" rx="22" ry="11" fill="${item("Shoes")?.color || fur}"/>
 ${a.Frame ? '<circle cx="180" cy="180" r="169" fill="none" stroke="#d7a1bd" stroke-width="8" stroke-dasharray="5 9"/>' : ""}
 ${a.Effect ? '<g fill="#dfbc68"><path d="M66 116l5 13 13 5-13 5-5 13-5-13-13-5 13-5zM288 193l5 13 13 5-13 5-5 13-5-13-13-5 13-5zM275 64l4 10 10 4-10 4-4 10-4-10-10-4 10-4z"/></g>' : ""}</svg>`;
}
export function gift(color = "#e4dcee") {
  return `<svg viewBox="0 0 180 160" aria-hidden="true"><ellipse cx="90" cy="142" rx="56" ry="9" fill="#524456" opacity=".08"/><path d="M42 62h96v69q-48 18-96 0z" fill="${color}" stroke="#827185" stroke-width="2"/><path d="M37 53l53-14 53 14v25l-53 13-53-13z" fill="${color}" stroke="#827185" stroke-width="2"/><path d="M90 88v57M37 65l53 13 53-13M80 42v35l20 5V43" fill="none" stroke="#fffdf8" stroke-width="10"/><path d="M89 40C30 14 65 3 89 40C118 0 147 21 89 40" fill="none" stroke="#bc8da3" stroke-width="10" stroke-linecap="round"/><path d="M105 109l4-10 4 10 10 4-10 4-4 10-4-10-10-4z" fill="#fffdf8"/></svg>`;
}
