import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { randomUUID } from "node:crypto";
import { availableProviders, generateReply } from "./providers.js";
import { addMessage, createConversation, deleteConversation, getConversation, listConversations } from "./db.js";

const app = express();
const port = Number(process.env.PORT || 8787);
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: (process.env.CORS_ORIGIN || "http://localhost:5173").split(",").map(s => s.trim()) }));
app.use(express.json({ limit: "1mb" }));
app.use("/api/", rateLimit({ windowMs: 60_000, limit: 60, standardHeaders: "draft-7", legacyHeaders: false }));

app.get("/api/health", (_req, res) => res.json({ ok: true, app: "NEXUS AI", version: "0.1.0" }));
app.get("/api/providers", (_req, res) => res.json(availableProviders()));
app.get("/api/conversations", (_req, res) => res.json(listConversations()));
app.get("/api/conversations/:id", (req, res) => {
  const conversation = getConversation(req.params.id);
  if (!conversation) return res.status(404).json({ error: "Conversation not found." });
  res.json(conversation);
});
app.delete("/api/conversations/:id", (req, res) => {
  if (!deleteConversation(req.params.id)) return res.status(404).json({ error: "Conversation not found." });
  res.status(204).end();
});

app.post("/api/chat", async (req, res) => {
  const { conversationId, message, provider } = req.body || {};
  if (typeof message !== "string" || !message.trim() || message.length > 12000) {
    return res.status(400).json({ error: "Message must contain 1–12,000 characters." });
  }
  if (provider && !["gemini", "openai"].includes(provider)) return res.status(400).json({ error: "Unknown provider." });
  const id = conversationId || randomUUID();
  const now = new Date().toISOString();
  let conversation = getConversation(id);
  if (!conversation) {
    createConversation(id, message.trim().slice(0, 48), now);
    conversation = { id, messages: [] };
  }
  const history = [...conversation.messages, { role: "user", content: message.trim() }].slice(-24);
  try {
    const result = await generateReply({ provider, messages: history });
    addMessage({ id: randomUUID(), conversation_id: id, role: "user", content: message.trim(), created_at: now });
    const assistantMessage = { id: randomUUID(), conversation_id: id, role: "assistant", content: result.text, provider: result.provider, model: result.model, created_at: new Date().toISOString() };
    addMessage(assistantMessage);
    res.json({ conversationId: id, reply: assistantMessage, provider: result.provider, model: result.model });
  } catch (error) {
    res.status(502).json({ error: error.message || "AI provider request failed." });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`NEXUS AI API listening on :${port}`);
});