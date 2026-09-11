import http from "node:http";
import { createHash } from "node:crypto";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../public", import.meta.url));
const port = Number(process.env.PORT || 3000);
const mime = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".png": "image/png", ".webp": "image/webp", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml", ".json": "application/json"
};

function json(res, status, body) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  res.end(JSON.stringify(body));
}

async function readJsonBody(req, maxBytes = 64 * 1024) {
  const chunks = []; let bytes = 0;
  for await (const chunk of req) {
    bytes += chunk.length;
    if (bytes > maxBytes) throw new Error("Request body too large.");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

const ancestryDirections = {
  skeldran: "Skeldran/Northwestern ancestry: northern-European-inspired facial structure; fair to light weathered skin; blue, pale blue, gray, gray-green, or green eyes; blond, red, strawberry blond, light brown, or dark blond hair. Do not turn this into Viking cosplay.",
  asterian: "Asterian/Central Mediterranean ancestry: Mediterranean facial structure; light to olive skin; dark brown or black hair, often wavy or curly; brown, hazel, amber, or dark green eyes.",
  serathi: "Serathi/Southeastern ancestry: Levantine/eastern-Mediterranean facial structure; olive to brown skin; dark brown or black hair, often curly or wavy; brown, amber, or hazel eyes.",
  kaishin: "Kaishin/Eastern ancestry: East-Asian-inspired facial structure; straight black or dark-brown hair; brown/dark eyes; light to medium skin with substantial regional variation. Do not make a Northwestern face in Eastern clothing."
};
const cultureDirections = {
  skeldran: "Skeldran material culture: early-modern northern maritime clothing in wool, linen, oilskin and leather, dark steel/brass used functionally, restrained ancestral geometric ornament, fur only sparingly. Avoid horned helmets, random runes, gears everywhere, and Victorian steampunk.",
  asterian: "Asterian material culture: classical-descended early-modern Mediterranean maritime society; fine linen/light wool, elegant civic or scholarly tailoring, bronze/brass accents and restrained Arcane details. No everyday togas, hoplite cosplay, generic wizard robes, or neon magitech.",
  serathi: "Serathi material culture: Levantine/eastern-Mediterranean early-modern maritime tailoring, linen/cotton/wool, patterned woven accents, brass/steel and Covenant-influenced institutions without fantasy-Arabian cliché.",
  kaishin: "Kaishin material culture: original East-Asian-derived imperial maritime culture blending Chinese/Japanese/Korean historical DNA; layered practical clothing, lacquer/steel/bronze used logically, restrained ornament. No anime armor or oversized fantasy swords.",
  vesperan: "Vesperan material culture: a cosmopolitan strait civilization with a coherent local identity and restrained Asterian/Serathi/eastern-Mediterranean trade influences.",
  outer_isles: "Outer Isles material culture: practical Atlantic/Caribbean frontier and privateer clothing built from traded, captured, repaired and improvised goods. Avoid all-black pirate costume clichés and skulls everywhere."
};

function safeText(value, fallback = "unspecified") {
  const text = String(value ?? fallback).replace(/[\r\n]+/g, " ").trim();
  return text.slice(0, 120) || fallback;
}

function portraitPrompt(payload) {
  const request = payload?.request ?? {};
  const character = payload?.character ?? {};
  const ancestry = safeText(request.ancestryPrimary, "skeldran");
  const culture = safeText(request.culture ?? character.culture, "skeldran");
  const ancestryRule = ancestryDirections[ancestry] ?? ancestryDirections.skeldran;
  const cultureRule = cultureDirections[culture] ?? cultureDirections.skeldran;
  const secondary = request.ancestrySecondary ? `Mixed ancestry is deliberate: secondary ancestry ${safeText(request.ancestrySecondary)} should be a believable inherited influence without erasing the primary ancestry.` : "";
  return [
    "Create one canonical character portrait for the original game Ebbing Tides.",
    "Semi-realistic painted CRPG illustration, late-17th/early-18th-century fantasy, grounded historical realism, restrained fantasy, painterly texture, muted natural lighting. One person only. Face clearly visible. Chest-up or waist-up framing appropriate to the described profession. No text, frame, UI, logos, modern objects, plastic skin, beauty-filter look, anime, glossy mobile-fantasy rendering, or generic heroic glamour.",
    ancestryRule, secondary, cultureRule,
    `Sex: ${safeText(request.sex)}. Apparent age band: ${safeText(request.ageBand)}; exact age ${safeText(character.age)}. Build: ${safeText(request.build)}. Complexion: ${safeText(request.complexion)}. Face character: ${safeText(request.faceCharacter)}. Eyes: ${safeText(request.eyeColor)}. Hair: ${safeText(request.hairColor)}, ${safeText(request.hairStyle)}. Facial hair: ${safeText(request.facialHair)}. Marks/weathering: ${Array.isArray(request.marks) ? request.marks.map((v)=>safeText(v)).join(", ") || "none specified" : "none specified"}.`,
    `Homeland: ${safeText(character.homelandRegion)}. Home settlement ID: ${safeText(character.homeSettlementId)}. Campaign starting location ID: ${safeText(character.startingLocationId)}. Culture: ${culture}. Religion: ${safeText(character.religion)}. Profession: ${safeText(character.profession)}. Social origin: ${safeText(character.socialOrigin)}. Religion should modify visible presentation only when logical; it must not replace local culture.`,
    "Choose a composition that reflects this person's actual life rather than defaulting to the same naval-officer pose: use a plausible deck, chart room, dock office, foundry, tavern/merchant interior, quiet painted backdrop, workshop, shrine, or harbor setting based on profession and history. Vary posture, camera angle, expression, and clothing silhouette naturally. Ordinary people should look ordinary enough that exceptional characters remain exceptional."
  ].filter(Boolean).join("\n");
}

async function generatePortrait(req, res) {
  if (!process.env.OPENAI_API_KEY) return json(res, 503, { error: "Custom portrait generation is unavailable until OPENAI_API_KEY is set on the local server. Curated portraits remain fully usable offline." });
  try {
    const payload = await readJsonBody(req);
    if (!payload?.request?.enabled) return json(res, 400, { error: "A structured custom portrait request is required." });
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { "authorization": `Bearer ${process.env.OPENAI_API_KEY}`, "content-type": "application/json" },
      body: JSON.stringify({ model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-2", prompt: portraitPrompt(payload), size: "1024x1536", quality: "medium" })
    });
    const data = await response.json();
    if (!response.ok) return json(res, response.status, { error: data?.error?.message || "OpenAI image generation failed." });
    const b64 = data?.data?.[0]?.b64_json;
    if (!b64) return json(res, 502, { error: "Image generation returned no image bytes." });
    const bytes = Buffer.from(b64, "base64");
    const hash = createHash("sha256").update(bytes).digest("hex").slice(0, 16);
    const dir = join(root, "generated", "portraits"); await mkdir(dir, { recursive: true });
    const filename = `custom_${hash}.png`; await writeFile(join(dir, filename), bytes);
    return json(res, 200, { portraitId: `portrait.custom.${hash}`, path: `/generated/portraits/${filename}`, model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-2" });
  } catch (error) {
    return json(res, 500, { error: error instanceof Error ? error.message : "Custom portrait generation failed." });
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const rawPath = decodeURIComponent((req.url || "/").split("?")[0] || "/");
    if (req.method === "POST" && rawPath === "/api/portrait/generate") return await generatePortrait(req, res);
    if (req.method !== "GET" && req.method !== "HEAD") return json(res, 405, { error: "Method not allowed." });
    const requested = rawPath === "/" ? "/alpha/index.html" : rawPath;
    const safe = normalize(requested).replace(/^([.][.][/\\])+/, "");
    let path = join(root, safe);
    const info = await stat(path).catch(() => undefined);
    if (info?.isDirectory()) path = join(path, "index.html");
    const body = await readFile(path);
    res.writeHead(200, { "content-type": mime[extname(path)] || "application/octet-stream", "cache-control": "no-store" });
    if (req.method === "HEAD") return res.end();
    res.end(body);
  } catch {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Ebbing Tides Alpha 0.6C: http://localhost:${port}/alpha/`);
});
