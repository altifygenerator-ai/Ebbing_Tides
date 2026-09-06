import { NextRequest, NextResponse } from "next/server";

interface RequestBody {
  context: Record<string, unknown>;
  playerText: string;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "OPENAI_API_KEY is not configured." }, { status: 503 });

  const body = await request.json() as RequestBody;
  const model = process.env.OPENAI_MODEL || "gpt-5.6";
  const system = [
    "You perform a character in Ebbing Tides using only the structured context supplied by game code.",
    "Simulation is canonical. Never invent world truth, money, items, authority, deaths, wars, locations, or secret knowledge.",
    "Never mention Earth, AI, databases, hidden stats, game mechanics, or that this is a game.",
    "Return JSON only with keys: text, interpretedIntent, proposedMemory, proposedEffects.",
    "proposedEffects must be an array of typed proposals; game code decides whether any proposal becomes canon."
  ].join("\n");

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { "authorization": `Bearer ${apiKey}`, "content-type": "application/json" },
    body: JSON.stringify({
      model,
      input: [
        { role: "system", content: [{ type: "input_text", text: system }] },
        { role: "user", content: [{ type: "input_text", text: JSON.stringify({ context: body.context, playerText: body.playerText }) }] }
      ]
    })
  });
  if (!response.ok) return NextResponse.json({ error: "Character Mind provider call failed." }, { status: 502 });
  const data = await response.json() as {
    output_text?: string;
    output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
  };
  const outputText = data.output_text ?? data.output
    ?.flatMap((item) => item.content ?? [])
    .find((item) => item.type === "output_text" && typeof item.text === "string")
    ?.text;
  try {
    const parsed = JSON.parse(outputText ?? "{}") as Record<string, unknown>;
    return NextResponse.json({ ...parsed, source: "openai" });
  } catch {
    return NextResponse.json({ error: "Character Mind returned invalid structured output." }, { status: 502 });
  }
}
