import DOMPurify from "dompurify";

export type Letter = {
  id: string;
  number: number;
  title: string;
  body_html: string;
  active: boolean;
};

export type Origin =
  | { kind: "direct" }
  | { kind: "volunteer"; name: string; matricula: string; volunteerId: string }
  | { kind: "share"; senderName: string | null; volunteerId: string | null; shareId: string };

export function renderLetterHtml(html: string, name: string) {
  const withName = (html ?? "").replaceAll("{name}", escapeHtml(name || "amigo(a)"));
  if (typeof window === "undefined") return withName;
  return DOMPurify.sanitize(withName, {
    ALLOWED_TAGS: ["p", "b", "strong", "i", "em", "u", "br", "ul", "ol", "li", "div", "span", "h3"],
    ALLOWED_ATTR: ["style"],
  });
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function padNumber(n: number) {
  return String(n).padStart(2, "0");
}

export function matriculaToEmail(matricula: string) {
  return `${matricula.trim().toLowerCase().replace(/[^a-z0-9]/g, "")}@cartas.local`;
}

export function makeToken() {
  return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6);
}

const SESSION_KEY = "cartas.session.v1";

export type VisitorSession = {
  name: string;
  accessLogId: string;
  readLetterIds: string[];
};

export function loadSession(): VisitorSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as VisitorSession) : null;
  } catch {
    return null;
  }
}

export function saveSession(session: VisitorSession) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SESSION_KEY);
}
