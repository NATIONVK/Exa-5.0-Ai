const jsonHeaders = { "Content-Type": "application/json" };

export function availableProviders() {
  return {
    gemini: { configured: Boolean(process.env.GEMINI_API_KEY), model: process.env.GEMINI_MODEL || "gemini-2.5-flash" },
    openai: { configured: Boolean(process.env.OPENAI_API_KEY), model: process.env.OPENAI_MODEL || "gpt-4.1-mini" }
  };
}

export async function generateReply({ provider, messages }) {
  const selected = provider || process.env.DEFAULT_PROVIDER || "gemini";
  if (selected === "gemini") return geminiReply(messages);
  if (selected === "openai") return openaiReply(messages);
  throw new Error("Unsupported provider. Choose gemini or openai.");
}

async function geminiReply(messages) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("Gemini is not configured. Add GEMINI_API_KEY to the server environment.");
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const contents = messages.filter(m => m.role === "user" || m.role === "assistant").map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: String(m.content).slice(0, 20000) }]
  }));
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`, {
    method: "POST", headers: jsonHeaders, body: JSON.stringify({ contents, generationConfig: { temperature: 0.7, maxOutputTokens: 2048 } })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error?.message || `Gemini request failed (${response.status}).`);
  const text = data.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("").trim();
  if (!text) throw new Error("Gemini returned an empty response.");
  return { text, provider: "gemini", model };
}

async function openaiReply(messages) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OpenAI is not configured. Add OPENAI_API_KEY to the server environment.");
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { ...jsonHeaders, Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      instructions: "You are NEXUS AI, a helpful bilingual Bangla-English personal assistant. Be honest about capabilities. Never claim to have performed external actions unless a connected tool confirms success.",
      input: messages.filter(m => m.role === "user" || m.role === "assistant").map(m => ({ role: m.role, content: [{ type: "input_text", text: String(m.content).slice(0, 20000) }] }))
    })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error?.message || `OpenAI request failed (${response.status}).`);
  const text = data.output?.flatMap(item => item.content || []).filter(item => item.type === "output_text").map(item => item.text).join("\n").trim();
  if (!text) throw new Error("OpenAI returned an empty response.");
  return { text, provider: "openai", model };
}