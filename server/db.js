import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const dbPath = process.env.DATABASE_PATH || "./data/nexus.sqlite";
fs.mkdirSync(path.dirname(path.resolve(dbPath)), { recursive: true });
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.exec(`
  CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK(role IN ('user','assistant')),
    content TEXT NOT NULL,
    provider TEXT,
    model TEXT,
    created_at TEXT NOT NULL
  );
`);
db.pragma("foreign_keys = ON");

export function listConversations() {
  return db.prepare("SELECT c.*, (SELECT content FROM messages m WHERE m.conversation_id=c.id ORDER BY m.created_at DESC LIMIT 1) AS preview FROM conversations c ORDER BY updated_at DESC").all();
}
export function getConversation(id) {
  const conversation = db.prepare("SELECT * FROM conversations WHERE id=?").get(id);
  if (!conversation) return null;
  conversation.messages = db.prepare("SELECT id, role, content, provider, model, created_at FROM messages WHERE conversation_id=? ORDER BY created_at ASC").all(id);
  return conversation;
}
export function createConversation(id, title, now) {
  db.prepare("INSERT INTO conversations(id,title,created_at,updated_at) VALUES(?,?,?,?)").run(id, title, now, now);
}
export function addMessage(message) {
  db.prepare("INSERT INTO messages(id,conversation_id,role,content,provider,model,created_at) VALUES(?,?,?,?,?,?,?)")
    .run(message.id, message.conversation_id, message.role, message.content, message.provider || null, message.model || null, message.created_at);
  db.prepare("UPDATE conversations SET updated_at=? WHERE id=?").run(message.created_at, message.conversation_id);
}
export function deleteConversation(id) {
  const result = db.prepare("DELETE FROM conversations WHERE id=?").run(id);
  return result.changes > 0;
}